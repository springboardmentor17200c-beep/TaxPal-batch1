const admin = require('firebase-admin');

// Check if Firebase credentials are available
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.warn('⚠️  Firebase credentials not found in environment variables. Firebase authentication will not work.');
  module.exports = null;
} else {
  try {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    console.log('✅ Firebase Admin initialized successfully');
    module.exports = admin;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    module.exports = null;
  }
}