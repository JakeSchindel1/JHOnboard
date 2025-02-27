import * as admin from 'firebase-admin';

// Only initialize if all required environment variables are present
if (!admin.apps.length && 
    process.env.FIREBASE_PROJECT_ID && 
    process.env.FIREBASE_CLIENT_EMAIL && 
    process.env.FIREBASE_PRIVATE_KEY) {
  
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
} else if (!admin.apps.length) {
  console.warn('Firebase Admin not initialized: Missing environment variables');
}

export const auth = admin.apps.length ? admin.auth() : null;
export default admin; 