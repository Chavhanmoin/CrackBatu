// createadmins.js

// Load environment variables from .env.local
require('dotenv').config({ path: './.env.local' });

const admin = require("firebase-admin");
const path = require("path");

// Get values from .env.local
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";

// Check if serviceAccountPath is defined
if (!serviceAccountPath) {
  console.error("❌ FIREBASE_SERVICE_ACCOUNT_PATH is not defined in .env.local");
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(path.resolve(serviceAccountPath));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();
const auth = admin.auth();

// Define admins
const admins = [
  { name: "Super Admin 1", email: "superadmin1@crackbatu.in", role: "super_admin" },
  { name: "Super Admin 2", email: "superadmin2@crackbatu.in", role: "super_admin" },
  { name: "Computer Admin", email: "computeradmin@crackbatu.in", role: "computer_admin", department: "Computer" },
  { name: "Civil Admin", email: "civiladmin@crackbatu.in", role: "civil_admin", department: "Civil" },
  { name: "Electrical Admin", email: "electricaladmin@crackbatu.in", role: "electrical_admin", department: "Electrical" },
  { name: "Mechanical Admin", email: "mechanicaladmin@crackbatu.in", role: "mechanical_admin", department: "Mechanical" },
  { name: "First Year Admin", email: "firstyearadmin@crackbatu.in", role: "firstyear_admin", department: "First Year" },
];

(async () => {
  for (let a of admins) {
    try {
      // Create user in Firebase Auth
      const userRecord = await auth.createUser({
        email: a.email,
        emailVerified: true,
        password: defaultPassword,
        displayName: a.name,
      });

      console.log(`✅ Created user: ${a.name} (${a.email})`);

      // Create Firestore doc
      await firestore.collection("users").doc(userRecord.uid).set({
        uid: userRecord.uid,
        name: a.name,
        email: a.email,
        role: a.role,
        department: a.department || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: null,
      });

      console.log(`📄 Firestore doc created for: ${a.name}`);
    } catch (err) {
      console.error(`❌ Error creating ${a.name}:`, err.message);
    }
  }

  console.log("🎉 All admins processed.");
})();
