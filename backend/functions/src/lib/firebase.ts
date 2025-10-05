import * as admin from "firebase-admin";

const resolvedProjectId =
  process.env.GCLOUD_PROJECT ||
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.FIREBASE_PROJECT_ID ||
  "demo-zeroprint";

if (admin.apps.length === 0) {
  admin.initializeApp({projectId: resolvedProjectId} as any);
}

export const db = admin.firestore();
export const auth = admin.auth();
export {admin};
