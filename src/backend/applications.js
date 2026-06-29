import { db } from "@/lib/firebaseAdmin";

export async function addApplication(uid, appData) {
  const docRef = await db.collection("applications").add({
    userId: uid,
    ...appData,
    status: "applied",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return docRef.id;
}

export async function getApplications(uid) {
  const snapshot = await db
    .collection("applications")
    .where("userId", "==", uid)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateApplication(appId, updatedData) {
  if (!appId) {
    throw new Error("Application ID is required");
  }

  await db.collection("applications").doc(appId).update({
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });

  return appId;
}

export async function deleteApplication(appId) {
  if (!appId) {
    throw new Error("Application ID is required");
  }

  await db.collection("applications").doc(appId).delete();

  return appId;
}

export async function saveAIAnalysis(appId, analysis) {
  await db.collection("applications").doc(appId).update({
    aiAnalysis: {
      ...analysis,
      analyzedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });

  return appId;
}

export async function getAIAnalysis(appId) {
  const docSnap = await db.collection("applications").doc(appId).get();

  if (!docSnap.exists) return null;

  return docSnap.data().aiAnalysis || null;
}

export async function saveInterviewQuestions(appId, questions) {
  await db.collection("applications").doc(appId).update({
    interviewQuestions: {
      ...questions,
      generatedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  });

  return appId;
}

export async function getInterviewQuestions(appId) {
  const docSnap = await db.collection("applications").doc(appId).get();

  if (!docSnap.exists) return null;

  return docSnap.data().interviewQuestions || null;
}