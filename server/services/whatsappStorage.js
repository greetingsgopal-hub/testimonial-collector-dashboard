// WhatsApp Incoming Video Storage Service (Firebase Admin SDK)
// Saves raw video to Firebase Storage and stores only storagePath in Firestore (No expiring download URLs)

export const saveWhatsAppVideo = async ({ bucket, db, FieldValue, phone, id, videoBuffer }) => {
  // After uploading to Firebase Storage whatsapp/{phone}/{id}.mp4
  const fileRef = bucket.file(`whatsapp/${phone}/${id}.mp4`);
  await fileRef.save(videoBuffer);

  // DON'T save download URL (expires)
  const storagePath = `whatsapp/${phone}/${id}.mp4`;
  // Save only path
  await db.collection('whatsapp_incoming').doc(id).set({
    phone,
    storagePath, // <-- save path, not URL
    createdAt: FieldValue.serverTimestamp(),
    // videoUrl: await getDownloadURL() // DELETE THIS LINE
  });

  return { storagePath, id, phone };
};

export default { saveWhatsAppVideo };
