import { db } from "./firebase.js";
import { collection, addDoc } from "firebase/firestore";

const button = document.getElementById("testBtn");
const statusText = document.getElementById("status");

button.addEventListener("click", async () => {
  statusText.textContent = "Sending data to Firestore...";
  try {
    const docRef = await addDoc(collection(db, "web_clicks"), {
      message: "Hello from the CoverScope Browser UI!",
      clicked_at: new Date().toISOString()
    });
    statusText.textContent = `Success! Saved with ID: ${docRef.id}`;
  } catch (error) {
    statusText.textContent = `Error: ${error.message}`;
  }
});
