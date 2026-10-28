// Phase 2: WhatsApp Business API - Incoming video, no app, no link
import { Hono } from 'hono';

const app = new Hono<any>();

// Webhook verification (Meta)
app.get('/api/whatsapp/incoming', (c) => {
  const mode = c.req.query('hub.mode');
  const token = c.req.query('hub.verify_token');
  const challenge = c.req.query('hub.challenge');
  if (mode === 'subscribe' && token === (c.env?.WHATSAPP_VERIFY_TOKEN || 'pandapraise_secret_token')) {
    return c.text(challenge || '');
  }
  return c.text('Forbidden', 403);
});

// Incoming message (customer replies with video)
app.post('/api/whatsapp/incoming', async (c) => {
  const body = await c.req.json();
  const entry = body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];
  const contact = entry?.contacts?.[0];
  
  if (!message) return c.json({ ok: true });
  
  const from = message.from; // phone number
  const type = message.type; // video, text, image
  
  if (type !== 'video') {
    // If text like "video", prompt again
    return c.json({ ok: true, ignored: 'not video' });
  }
  
  const videoId = message.video?.id || 'demo_video';
  const mime = message.video?.mime_type || 'video/mp4';
  const storagePath = `whatsapp/${from}/${videoId}.mp4`;
  
  // 1. Download video from Meta Cloud API (if configured)
  if (c.env?.WHATSAPP_TOKEN && videoId !== 'demo_video') {
    try {
      const mediaUrlRes = await fetch(`https://graph.facebook.com/v20.0/${videoId}`, {
        headers: { 'Authorization': `Bearer ${c.env.WHATSAPP_TOKEN}` }
      });
      const { url } = await mediaRes.json() as any;
      
      const videoBlob = await fetch(url, {
        headers: { 'Authorization': `Bearer ${c.env.WHATSAPP_TOKEN}` }
      }).then(r => r.arrayBuffer());
      
      // 2. Upload to Firebase Storage / R2
      if (c.env?.PANDA_R2) {
        await c.env.PANDA_R2.put(storagePath, videoBlob, { httpMetadata: { contentType: mime } });
      }
    } catch (err) {
      console.warn('Meta WhatsApp media fetch warning:', err);
    }
  }
  
  // 3. Create testimonial record
  const testimonial = {
    id: `wa_${Date.now()}`,
    source: 'whatsapp',
    phone: from,
    name: contact?.profile?.name || from,
    status: 'pending',
    storagePath, // <-- save path, not URL
    // videoUrl: await getDownloadURL() // DELETE THIS LINE
    rating: 5,
    createdAt: Date.now(),
    shop: entry?.metadata?.display_phone_number || 'kalyan-silks.myshopify.com',
    content: message.video?.caption || 'Customer video review via WhatsApp'
  };
  
  // Save to KV for dashboard real-time
  if (c.env?.PANDA_KV) {
    await c.env.PANDA_KV.put(`testimonial:${testimonial.id}`, JSON.stringify(testimonial));
  }
  
  // 4. Auto-reply thank you via WhatsApp
  if (c.env?.WHATSAPP_TOKEN && c.env?.WHATSAPP_PHONE_ID) {
    try {
      await fetch(`https://graph.facebook.com/v20.0/${c.env.WHATSAPP_PHONE_ID}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${c.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: from,
          text: { body: `Thanks ${testimonial.name}! Got your video 🎉 We'll feature it and send you ₹200 reward on UPI.` }
        })
      });
    } catch {}
  }
  
  return c.json({ ok: true, testimonialId: testimonial.id });
});

export default app;
