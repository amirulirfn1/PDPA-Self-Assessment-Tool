const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: "https://<your-database-name>.firebaseio.com",
});

// Function to set custom claims
const setAdminClaim = async (uid) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role: "admin" });
    console.log(`Custom claims set for user ${uid}`);
  } catch (error) {
    console.error("Error setting custom claims:", error);
  }
};

// Replace with the UID of the user you want to make an admin
const userUid = "USER_UID_HERE";
setAdminClaim(userUid);
