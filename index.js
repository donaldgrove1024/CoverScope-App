import { db } from "./firebase.js";
import { collection, addDoc } from "firebase/firestore";

async function addTestData() {
  try {
    // Add a new document with a generated ID to a collection named "users_test"
    const docRef = await addDoc(collection(db, "users_test"), {
      app_name: "CoverScope",
      developer: "Owner",
      connected_at: new Date().toISOString()
    });
    console.log("Success! Document written to Firestore with ID:", docRef.id);
  } catch (error) {
    console.error("Error writing document to database:", error);
  }
}

addTestData();
