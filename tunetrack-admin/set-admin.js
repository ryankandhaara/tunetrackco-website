const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./tunetrack-co-firebase-adminsdk-fbsvc-9cd48010ce.json");

const app = initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth(app);

const ADMIN_UID = "ZwE9DpdwRqNtMjqrSyGMTL4Byzh2";

async function makeAdmin() {
  try {
    await auth.setCustomUserClaims(ADMIN_UID, {
      admin: true
    });

    console.log("");
    console.log("=================================");
    console.log("✅ ADMIN CLAIM SET SUCCESSFULLY");
    console.log("UID:", ADMIN_UID);
    console.log("admin: true");
    console.log("=================================");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("❌ FAILED TO SET ADMIN CLAIM");
    console.error(error);
    console.error("");
    process.exit(1);
  }
}

makeAdmin();
