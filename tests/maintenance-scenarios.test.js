import {
  initializeApp,
  deleteApp,
} from "firebase/app";
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import {
  SCENARIO_COUNT,
  buildMaintenanceScenarios,
} from "./maintenanceScenarios.js";

const PROJECT_ID = "coverscope-ac374";
const SCENARIOS = buildMaintenanceScenarios(SCENARIO_COUNT);

function parseHostPort(value, fallbackHost, fallbackPort) {
  const raw = (value || `${fallbackHost}:${fallbackPort}`).replace(/^https?:\/\//, "");
  const [host, port] = raw.split(":");
  return { host, port: Number(port) || fallbackPort };
}

function createEmulatorSession(appName) {
  const app = initializeApp(
    {
      apiKey: "demo-coverscope-api-key",
      authDomain: `${PROJECT_ID}.firebaseapp.com`,
      projectId: PROJECT_ID,
    },
    appName
  );
  const auth = getAuth(app);
  const db = getFirestore(app);
  const authTarget = parseHostPort(process.env.FIREBASE_AUTH_EMULATOR_HOST, "127.0.0.1", 9099);
  const firestoreTarget = parseHostPort(process.env.FIRESTORE_EMULATOR_HOST, "127.0.0.1", 8080);

  try {
    connectAuthEmulator(auth, `http://${authTarget.host}:${authTarget.port}`, {
      disableWarnings: true,
    });
  } catch (error) {
    if (!String(error?.message || error).includes("already been called")) {
      throw error;
    }
  }

  try {
    connectFirestoreEmulator(db, firestoreTarget.host, firestoreTarget.port);
  } catch (error) {
    if (!String(error?.message || error).includes("already been called")) {
      throw error;
    }
  }

  return { app, auth, db };
}

async function writeScenarios(db, uid, scenarios) {
  const chunks = [];
  for (let i = 0; i < scenarios.length; i += 400) {
    chunks.push(scenarios.slice(i, i + 400));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const scenario of chunk) {
      const ref = doc(db, "maintenance_scenarios", `${uid}-${scenario.scenarioId}`);
      batch.set(ref, {
        ...scenario,
        uid,
        createdAt: Timestamp.now(),
      });
    }
    await batch.commit();
  }
}

const emulatorConfigured = Boolean(
  process.env.FIRESTORE_EMULATOR_HOST && process.env.FIREBASE_AUTH_EMULATOR_HOST
);
const describeEmulators = emulatorConfigured ? describe : describe.skip;

describeEmulators("CoverScope 1,000 maintenance scenarios", () => {
  let ownerSession;
  let outsiderSession;
  let ownerUser;
  let outsiderUser;

  beforeAll(async () => {
    ownerSession = createEmulatorSession("owner-app");
    outsiderSession = createEmulatorSession("outsider-app");

    const suffix = Date.now();
    const ownerCred = await createUserWithEmailAndPassword(
      ownerSession.auth,
      `owner-${suffix}@coverscope.test`,
      "Maintenance-Test-1000!"
    );
    const outsiderCred = await createUserWithEmailAndPassword(
      outsiderSession.auth,
      `outsider-${suffix}@coverscope.test`,
      "Maintenance-Test-1000!"
    );

    ownerUser = ownerCred.user;
    outsiderUser = outsiderCred.user;
  });

  afterAll(async () => {
    if (ownerSession?.app) {
      await deleteApp(ownerSession.app);
    }
    if (outsiderSession?.app) {
      await deleteApp(outsiderSession.app);
    }
  });

  test("Auth emulator issues distinct users for owner and outsider sessions", () => {
    expect(ownerUser.uid).toBeTruthy();
    expect(outsiderUser.uid).toBeTruthy();
    expect(ownerUser.uid).not.toBe(outsiderUser.uid);
    expect(ownerUser.email).toMatch(/@coverscope\.test$/);
  });

  test("authenticated owner can persist and read all 1,000 maintenance scenarios", async () => {
    expect(SCENARIOS).toHaveLength(SCENARIO_COUNT);

    await writeScenarios(ownerSession.db, ownerUser.uid, SCENARIOS);

    const ownedQuery = query(
      collection(ownerSession.db, "maintenance_scenarios"),
      where("uid", "==", ownerUser.uid)
    );
    const snapshot = await getDocs(ownedQuery);
    expect(snapshot.size).toBe(SCENARIO_COUNT);

    const first = await getDoc(
      doc(ownerSession.db, "maintenance_scenarios", `${ownerUser.uid}-1`)
    );
    const last = await getDoc(
      doc(ownerSession.db, "maintenance_scenarios", `${ownerUser.uid}-1000`)
    );

    expect(first.exists()).toBe(true);
    expect(last.exists()).toBe(true);
    expect(first.data().maintenanceType).toBe(SCENARIOS[0].maintenanceType);
    expect(last.data().scenarioId).toBe(1000);
    expect(last.data().uid).toBe(ownerUser.uid);
  });

  test("unauthenticated clients cannot write maintenance scenarios", async () => {
    const guestSession = createEmulatorSession("guest-app");
    await signOut(guestSession.auth);

    await expect(
      setDoc(doc(guestSession.db, "maintenance_scenarios", "guest-1"), {
        uid: "guest",
        scenarioId: 1,
        vehicleType: "sedan",
        maintenanceType: "oil_change",
        status: "scheduled",
        priority: "low",
        intervalMiles: 5000,
        estimatedCost: 50,
        notes: "Unauthenticated write should fail",
        createdAt: Timestamp.now(),
      })
    ).rejects.toMatchObject({ code: "permission-denied" });

    await deleteApp(guestSession.app);
  });

  test("a second Auth user cannot read or overwrite another user's scenarios", async () => {
    await expect(
      getDoc(
        doc(
          outsiderSession.db,
          "maintenance_scenarios",
          `${ownerUser.uid}-1`
        )
      )
    ).rejects.toMatchObject({ code: "permission-denied" });

    await expect(
      setDoc(
        doc(
          outsiderSession.db,
          "maintenance_scenarios",
          `${ownerUser.uid}-1`
        ),
        {
          uid: outsiderUser.uid,
          scenarioId: 1,
          vehicleType: "truck",
          maintenanceType: "brake_service",
          status: "scheduled",
          priority: "high",
          intervalMiles: 8000,
          estimatedCost: 220,
          notes: "Ownership hijack should fail",
          createdAt: Timestamp.now(),
        }
      )
    ).rejects.toMatchObject({ code: "permission-denied" });
  });
});
