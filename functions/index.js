const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Razorpay = require("razorpay");
const crypto = require("crypto");
admin.initializeApp();

const db = admin.firestore();

// Initialize Razorpay with Live/Test Secrets from Firebase Environment Config
// Run: firebase functions:config:set razorpay.key_id="YOUR_KEY" razorpay.key_secret="YOUR_SECRET"
const razorpay = new Razorpay({
  key_id: functions.config().razorpay?.key_id || process.env.VITE_RAZORPAY_KEY_ID,
  key_secret: functions.config().razorpay?.key_secret || process.env.RAZORPAY_KEY_SECRET,
});

// 1. Create Razorpay Order Endpoint
exports.createRazorpayOrder = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const { amount, currency = "INR", planId, userId } = req.body;

    const options = {
      amount: Number(amount), // amount in subunits (paise or cents)
      currency: currency,
      receipt: `rcpt_${Date.now()}_${userId || "guest"}`,
      notes: { planId, userId: userId || "anonymous" },
    };

    const order = await razorpay.orders.create(options);
    
    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpay.key_id,
    });
  } catch (err) {
    console.error("Razorpay Order Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 2. Verify Razorpay Signature & Update Firebase Workspace Plan
exports.verifyRazorpayPayment = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).send("");

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      userId,
    } = req.body;

    const secret = razorpay.key_secret;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature verification failed." });
    }

    // Signature is valid! Update user's workspace plan in Firestore
    if (userId) {
      await db.collection("workspaces").doc(userId).update({
        plan: planId === "lifetime" ? "lifetime" : planId === "agency" ? "agency" : "pro",
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Log transaction in ledger
      await db.collection("payments").add({
        userId,
        planId,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        status: "Paid",
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return res.status(200).json({ success: true, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("Verification Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// 3. WhatsApp Incoming Webhook - Upload to Firebase Storage and save storagePath to Firestore
exports.whatsappIncoming = functions.https.onRequest(async (req, res) => {
  if (req.method === "GET") {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "panda_verify_2026";
    if (req.query["hub.verify_token"] === verifyToken) {
      return res.status(200).send(req.query["hub.challenge"]);
    }
    return res.status(403).send("Forbidden");
  }

  try {
    const entry = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = entry?.messages?.[0];

    if (message?.type === "video") {
      const id = message.video.id;
      const phone = message.from;
      const whatsappToken = process.env.WHATSAPP_TOKEN;

      let videoBuffer = Buffer.from("");
      if (whatsappToken) {
        const mediaRes = await fetch(`https://graph.facebook.com/v20.0/${id}`, {
          headers: { Authorization: `Bearer ${whatsappToken}` },
        });
        const { url } = await mediaRes.json();
        const resMedia = await fetch(url, {
          headers: { Authorization: `Bearer ${whatsappToken}` },
        });
        videoBuffer = Buffer.from(await resMedia.arrayBuffer());
      }

      // After uploading to Firebase Storage whatsapp/{phone}/{id}.mp4
      const bucket = admin.storage().bucket();
      const fileRef = bucket.file(`whatsapp/${phone}/${id}.mp4`);
      if (videoBuffer.length > 0) {
        await fileRef.save(videoBuffer, {
          metadata: { contentType: message.video?.mime_type || "video/mp4" },
        });
      }

      // DON'T save download URL (expires)
      const storagePath = `whatsapp/${phone}/${id}.mp4`;
      // Save only path
      await db.collection('whatsapp_incoming').doc(id).set({
        phone,
        storagePath, // <-- save path, not URL
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // videoUrl: await getDownloadURL() // DELETE THIS LINE
      }, { merge: true });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("WhatsApp Incoming Webhook Error:", err);
    return res.status(500).json({ error: err.message });
  }
});
