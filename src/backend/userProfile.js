import { db } from "@/lib/firebaseAdmin";

// Called once right after login — creates/updates the basic account record
export async function saveUserAccount(user) {
  const { uid, displayName, email, photoURL } = user;

  await db.collection("users").doc(uid).set(
    {
      name: displayName,
      email,
      photoURL,
      lastLogin: new Date().toISOString(),
    },
    { merge: true }
  );

  return uid;
}

// Called from the dashboard's step 1 form
export async function saveUserProfile(uid, profileData) {
  // profileData: { experience, currentRole, expectedRole, linkedinUrl }
  await db.collection("users").doc(uid).set(
    {
      ...profileData,
      profileCompletedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return uid;
}

export async function getUserProfile(uid) {
  const docSnap = await db.collection("users").doc(uid).get();
  return docSnap.exists ? docSnap.data() : null;
}

export async function updateUserProfile(uid, updatedData) {
  await db.collection("users").doc(uid).update({
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });
  return uid;
}

export async function deleteUserProfile(uid) {
  await db.collection("users").doc(uid).delete();
  return uid;
}