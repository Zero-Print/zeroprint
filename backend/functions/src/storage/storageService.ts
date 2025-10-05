import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const uploadFile = functions.https.onCall(
  {
    region: "asia-south1",
  },
  async (request: CallableRequest) => {
    if (!request.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Must be logged in");
    }
    const bucket = admin.storage().bucket();
    await bucket.file(`users/${request.auth.uid}/test.txt`).save("Hello, Storage!");
    return {status: "success", message: "File uploaded"};
  }
);
