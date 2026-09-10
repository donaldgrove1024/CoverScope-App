process.env.FIRESTORE_EMULATOR_HOST ||= '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST ||= '127.0.0.1:9099';

import { initializeApp, deleteApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  signOut,
  User,
  Auth,
} from 'firebase/auth';
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
  Firestore,
} from 'firebase/firestore';
import { DEFAULT_POLICIES } from '../src/data/defaultPolicies';
import { generateClientSideTriageVerdict } from '../src/utils/localTriageFallback';
import { recommendationForStatus } from '../src/utils/coverageLogic';
import {
  SCENARIO_COUNT,
  buildMaintenanceScenarios,
  expectedCoverageStatus,
  MaintenanceScenario,
} from './maintenanceScenarios';

const PROJECT_ID = 'coverscope-ac374';
const SCENARIOS = buildMaintenanceScenarios(SCENARIO_COUNT);

function policyById(policyId: string) {
  const policy = DEFAULT_POLICIES.find((item) => item.id === policyId);
  if (!policy) {
    throw new Error(`Unknown policy id: ${policyId}`);
  }
  return policy;
}

function parseHostPort(value: string | undefined, fallbackHost: string, fallbackPort: number) {
  const raw = (value || `${fallbackHost}:${fallbackPort}`).replace(/^https?:\/\//, '');
  const [host, port] = raw.split(':');
  return { host, port: Number(port) || fallbackPort };
}

function createEmulatorSession(appName: string): { app: FirebaseApp; auth: Auth; db: Firestore } {
  const app = initializeApp(
    {
      apiKey: 'demo-coverscope-api-key',
      authDomain: `${PROJECT_ID}.firebaseapp.com`,
      projectId: PROJECT_ID,
    },
    appName
  );
  const auth = getAuth(app);
  const db = getFirestore(app);
  const authTarget = parseHostPort(process.env.FIREBASE_AUTH_EMULATOR_HOST, '127.0.0.1', 9099);
  const firestoreTarget = parseHostPort(process.env.FIRESTORE_EMULATOR_HOST, '127.0.0.1', 8080);

  try {
    connectAuthEmulator(auth, `http://${authTarget.host}:${authTarget.port}`, {
      disableWarnings: true,
    });
  } catch (error) {
    if (!String((error as Error)?.message || error).includes('already been called')) {
      throw error;
    }
  }

  try {
    connectFirestoreEmulator(db, firestoreTarget.host, firestoreTarget.port);
  } catch (error) {
    if (!String((error as Error)?.message || error).includes('already been called')) {
      throw error;
    }
  }

  return { app, auth, db };
}

async function writeScenarios(db: Firestore, uid: string, scenarios: MaintenanceScenario[]) {
  const chunks: MaintenanceScenario[][] = [];
  for (let i = 0; i < scenarios.length; i += 400) {
    chunks.push(scenarios.slice(i, i + 400));
  }

  for (const chunk of chunks) {
    const batch = writeBatch(db);
    for (const scenario of chunk) {
      const ref = doc(db, 'maintenance_scenarios', `${uid}-${scenario.scenarioId}`);
      batch.set(ref, {
        ...scenario,
        uid,
        createdAt: Timestamp.now(),
      });
    }
    await batch.commit();
  }
}

describe('CoverScope 1,000 maintenance scenarios', () => {
  let ownerSession: ReturnType<typeof createEmulatorSession>;
  let outsiderSession: ReturnType<typeof createEmulatorSession>;
  let ownerUser: User;
  let outsiderUser: User;

  beforeAll(async () => {
    ownerSession = createEmulatorSession('owner-app');
    outsiderSession = createEmulatorSession('outsider-app');

    const suffix = Date.now();
    const ownerCred = await createUserWithEmailAndPassword(
      ownerSession.auth,
      `owner-${suffix}@coverscope.test`,
      'Maintenance-Test-1000!'
    );
    const outsiderCred = await createUserWithEmailAndPassword(
      outsiderSession.auth,
      `outsider-${suffix}@coverscope.test`,
      'Maintenance-Test-1000!'
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

  test('generates a deterministic set of 1,000 warranty maintenance scenarios', () => {
    expect(SCENARIOS).toHaveLength(SCENARIO_COUNT);
    expect(SCENARIOS[0].scenarioId).toBe(1);
    expect(SCENARIOS[SCENARIO_COUNT - 1].scenarioId).toBe(1000);
    expect(new Set(SCENARIOS.map((scenario) => scenario.scenarioId)).size).toBe(SCENARIO_COUNT);
  });

  test('Auth emulator issues distinct users for owner and outsider sessions', () => {
    expect(ownerUser.uid).toBeTruthy();
    expect(outsiderUser.uid).toBeTruthy();
    expect(ownerUser.uid).not.toBe(outsiderUser.uid);
    expect(ownerUser.email).toMatch(/@coverscope\.test$/);
  });

  test('authenticated owner can persist and read all 1,000 maintenance scenarios', async () => {
    await writeScenarios(ownerSession.db, ownerUser.uid, SCENARIOS);

    const ownedQuery = query(
      collection(ownerSession.db, 'maintenance_scenarios'),
      where('uid', '==', ownerUser.uid)
    );
    const snapshot = await getDocs(ownedQuery);
    expect(snapshot.size).toBe(SCENARIO_COUNT);

    const first = await getDoc(doc(ownerSession.db, 'maintenance_scenarios', `${ownerUser.uid}-1`));
    const last = await getDoc(doc(ownerSession.db, 'maintenance_scenarios', `${ownerUser.uid}-1000`));

    expect(first.exists()).toBe(true);
    expect(last.exists()).toBe(true);
    expect(first.data()?.applianceOrPart).toBe(SCENARIOS[0].applianceOrPart);
    expect(last.data()?.scenarioId).toBe(1000);
    expect(last.data()?.uid).toBe(ownerUser.uid);
  });

  test('application logic returns the expected verdict for every stored scenario', async () => {
    const ownedQuery = query(
      collection(ownerSession.db, 'maintenance_scenarios'),
      where('uid', '==', ownerUser.uid)
    );
    const snapshot = await getDocs(ownedQuery);
    expect(snapshot.size).toBe(SCENARIO_COUNT);

    const counts = {
      LIKELY_COVERED: 0,
      LIKELY_DENIED: 0,
      AMBIGUOUS: 0,
    };

    snapshot.forEach((document) => {
      const data = document.data();
      const scenario: MaintenanceScenario = {
        scenarioId: data.scenarioId,
        category: data.category,
        applianceOrPart: data.applianceOrPart,
        symptomDescription: data.symptomDescription,
        rustOrCorrosionVisible: data.rustOrCorrosionVisible,
        preExistingSuspected: data.preExistingSuspected,
        diyAttempted: data.diyAttempted,
        waterLeakPresent: data.waterLeakPresent,
        maintenanceRecordsAvailable: data.maintenanceRecordsAvailable,
        policyId: data.policyId,
      };

      const expected = expectedCoverageStatus(scenario);
      const verdict = generateClientSideTriageVerdict({
        policy: policyById(scenario.policyId),
        symptomDescription: scenario.symptomDescription,
        category: scenario.category,
        applianceOrPart: scenario.applianceOrPart,
        rustOrCorrosionVisible: scenario.rustOrCorrosionVisible,
        preExistingSuspected: scenario.preExistingSuspected,
        diyAttempted: scenario.diyAttempted,
        maintenanceRecordsAvailable: scenario.maintenanceRecordsAvailable,
        waterLeakPresent: scenario.waterLeakPresent,
      });

      expect(verdict.status).toBe(expected);
      expect(verdict.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(verdict.confidenceScore).toBeLessThanOrEqual(100);
      expect(verdict.financialAnalysis.recommendation).toBe(recommendationForStatus(expected));
      expect(verdict.financialAnalysis.tradeCallFee).toBe(policyById(scenario.policyId).tradeServiceCallFee);
      expect(verdict.citedPolicyClauses.length).toBeGreaterThan(0);
      expect(verdict.denialTraps.some((trap) => trap.trapName === 'Lack of Maintenance Trap')).toBe(true);

      counts[expected] += 1;
    });

    expect(counts.LIKELY_COVERED).toBeGreaterThan(0);
    expect(counts.LIKELY_DENIED).toBeGreaterThan(0);
    expect(counts.AMBIGUOUS).toBeGreaterThan(0);
    expect(counts.LIKELY_COVERED + counts.LIKELY_DENIED + counts.AMBIGUOUS).toBe(SCENARIO_COUNT);
  });

  test('unauthenticated clients cannot write maintenance scenarios', async () => {
    const guestSession = createEmulatorSession('guest-app');
    await signOut(guestSession.auth);

    await expect(
      setDoc(doc(guestSession.db, 'maintenance_scenarios', 'guest-1'), {
        uid: 'guest',
        scenarioId: 1,
        category: 'HVAC',
        applianceOrPart: 'Lennox Central AC Condenser',
        symptomDescription: 'Unauthenticated write should fail',
        rustOrCorrosionVisible: false,
        preExistingSuspected: false,
        diyAttempted: false,
        waterLeakPresent: false,
        maintenanceRecordsAvailable: true,
        policyId: 'ahs-gold',
        createdAt: Timestamp.now(),
      })
    ).rejects.toMatchObject({ code: 'permission-denied' });

    await deleteApp(guestSession.app);
  });

  test('a second Auth user cannot read or overwrite another user\'s scenarios', async () => {
    await expect(
      getDoc(doc(outsiderSession.db, 'maintenance_scenarios', `${ownerUser.uid}-1`))
    ).rejects.toMatchObject({ code: 'permission-denied' });

    await expect(
      setDoc(doc(outsiderSession.db, 'maintenance_scenarios', `${ownerUser.uid}-1`), {
        uid: outsiderUser.uid,
        scenarioId: 1,
        category: 'HVAC',
        applianceOrPart: 'Hijacked Condenser',
        symptomDescription: 'Ownership hijack should fail',
        rustOrCorrosionVisible: false,
        preExistingSuspected: false,
        diyAttempted: false,
        waterLeakPresent: false,
        maintenanceRecordsAvailable: true,
        policyId: 'ahs-gold',
        createdAt: Timestamp.now(),
      })
    ).rejects.toMatchObject({ code: 'permission-denied' });
  });
});
