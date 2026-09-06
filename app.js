import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where,
} from "firebase/firestore";

const LABELS = {
  sedan: "Sedan",
  suv: "SUV",
  truck: "Truck",
  van: "Van",
  motorcycle: "Motorcycle",
  oil_change: "Oil change",
  brake_service: "Brake service",
  tire_rotation: "Tire rotation",
  battery_check: "Battery check",
  air_filter: "Air filter",
  coolant_flush: "Coolant flush",
  transmission_service: "Transmission",
  alignment: "Alignment",
  spark_plugs: "Spark plugs",
  inspection: "Inspection",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const authScreen = document.getElementById("auth-screen");
const appScreen = document.getElementById("app-screen");
const authForm = document.getElementById("auth-form");
const authStatus = document.getElementById("auth-status");
const jobForm = document.getElementById("job-form");
const jobStatus = document.getElementById("job-status-msg");
const jobList = document.getElementById("job-list");
const emptyBoard = document.getElementById("empty-board");
const statusFilter = document.getElementById("status-filter");
const userLabel = document.getElementById("user-label");

let currentUser = null;
let jobs = [];

function setStatus(el, message) {
  el.textContent = message || "";
}

function showApp(isSignedIn) {
  authScreen.classList.toggle("hidden", isSignedIn);
  appScreen.classList.toggle("hidden", !isSignedIn);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function renderStats() {
  const openJobs = jobs.filter((job) => job.status !== "cancelled");
  document.getElementById("stat-scheduled").textContent = String(
    jobs.filter((job) => job.status === "scheduled").length
  );
  document.getElementById("stat-progress").textContent = String(
    jobs.filter((job) => job.status === "in_progress").length
  );
  document.getElementById("stat-completed").textContent = String(
    jobs.filter((job) => job.status === "completed").length
  );
  document.getElementById("stat-cost").textContent = formatMoney(
    openJobs
      .filter((job) => job.status !== "completed")
      .reduce((sum, job) => sum + Number(job.estimatedCost || 0), 0)
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function renderJobs() {
  const filter = statusFilter.value;
  const visible = jobs.filter((job) => filter === "all" || job.status === filter);

  jobList.innerHTML = visible
    .sort((a, b) => b.scenarioId - a.scenarioId)
    .map((job) => `
      <li class="job-card">
        <header>
          <h3>${escapeHtml(LABELS[job.maintenanceType] || job.maintenanceType)}</h3>
          <span class="badge ${escapeHtml(job.priority)}">${escapeHtml(LABELS[job.status])} · ${escapeHtml(job.priority)}</span>
        </header>
        <p class="meta">${escapeHtml(LABELS[job.vehicleType])} · every ${escapeHtml(job.intervalMiles)} mi · ${escapeHtml(formatMoney(job.estimatedCost))}</p>
        <p class="meta">${escapeHtml(job.notes)}</p>
      </li>
    `)
    .join("");

  emptyBoard.classList.toggle("visible", visible.length === 0);
  renderStats();
}

async function loadJobs() {
  if (!currentUser) {
    jobs = [];
    renderJobs();
    return;
  }

  const snapshot = await getDocs(
    query(collection(db, "maintenance_scenarios"), where("uid", "==", currentUser.uid))
  );
  jobs = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  renderJobs();
}

function nextScenarioId() {
  const used = jobs.map((job) => Number(job.scenarioId) || 0);
  return (used.length ? Math.max(...used) : 0) + 1;
}

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  setStatus(authStatus, "Signing in...");
  try {
    await signInWithEmailAndPassword(auth, email, password);
    setStatus(authStatus, "");
  } catch (error) {
    setStatus(authStatus, error.message);
  }
});

document.getElementById("sign-up-btn").addEventListener("click", async () => {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  setStatus(authStatus, "Creating account...");
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    setStatus(authStatus, "");
  } catch (error) {
    setStatus(authStatus, error.message);
  }
});

document.getElementById("guest-btn").addEventListener("click", async () => {
  setStatus(authStatus, "Opening a guest desk...");
  try {
    await signInAnonymously(auth);
    setStatus(authStatus, "");
  } catch (error) {
    setStatus(authStatus, error.message);
  }
});

document.getElementById("sign-out-btn").addEventListener("click", async () => {
  await signOut(auth);
});

jobForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentUser) {
    return;
  }

  const scenarioId = nextScenarioId();
  if (scenarioId > 1000) {
    setStatus(jobStatus, "This desk already holds 1,000 coverage items.");
    return;
  }

  const payload = {
    uid: currentUser.uid,
    scenarioId,
    vehicleType: document.getElementById("vehicle-type").value,
    maintenanceType: document.getElementById("maintenance-type").value,
    status: document.getElementById("job-status").value,
    priority: document.getElementById("job-priority").value,
    intervalMiles: Number(document.getElementById("interval-miles").value),
    estimatedCost: Number(document.getElementById("estimated-cost").value),
    notes: document.getElementById("job-notes").value.trim(),
    createdAt: Timestamp.now(),
  };

  setStatus(jobStatus, "Saving coverage item...");
  try {
    await setDoc(doc(db, "maintenance_scenarios", `${currentUser.uid}-${scenarioId}`), payload);
    setStatus(jobStatus, `Saved scenario ${scenarioId}.`);
    await loadJobs();
  } catch (error) {
    setStatus(jobStatus, error.message);
  }
});

statusFilter.addEventListener("change", renderJobs);

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  showApp(Boolean(user));
  if (!user) {
    jobs = [];
    return;
  }

  userLabel.textContent = user.isAnonymous ? "Guest shop" : user.email;
  setStatus(jobStatus, "Loading coverage board...");
  try {
    await loadJobs();
    setStatus(jobStatus, jobs.length ? "" : "Board is ready. Log the first item.");
  } catch (error) {
    setStatus(jobStatus, error.message);
  }
});
