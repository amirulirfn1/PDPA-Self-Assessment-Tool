/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onCall, HttpsError} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();

exports.createAdminUser = onCall(async (request) => {
  const {email, name} = request.data;
  if (!email || !name) {
    throw new HttpsError("invalid-argument", "Email and name are required");
  }
  try {
    const tempPassword = crypto
        .randomBytes(12)
        .toString("base64")
        .slice(0, 16);

    const userRecord = await admin.auth().createUser({
      email,
      password: tempPassword,
    });

    await admin.firestore().collection("admins").doc(userRecord.uid).set({
      username: name,
      email,
      type: "admin",
    });

    await admin.auth().setCustomUserClaims(userRecord.uid, {admin: true});

    return {uid: userRecord.uid};
  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});
