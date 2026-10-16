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
