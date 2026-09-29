import { db } from "./db";
import { INITIAL_PATIENT } from "./sample-data";

export interface StoredAllergy {
  id: string;
  userId: string;
  name: string;
  category: "FOOD" | "ENVIRONMENTAL" | "MEDICATION" | "CONTACT";
  severity: "MILD" | "MODERATE" | "HIGH" | "ANAPHYLACTIC";
  diagnosedDate?: string | null;
  diagnosticType?: string | null;
  reactionDetails?: string | null;
  synonyms?: string | null;
  isVerified?: boolean;
}

export interface StoredProgressionLog {
  id: string;
  userId: string;
  eventDate: string;
  season?: string | null;
  year: number;
  allergenName: string;
  reactionType: string;
  severity: "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING";
  intervention?: string | null;
  environmentalFactors?: string | null;
  notes?: string | null;
}

export interface StoredScan {
  id: string;
  userId: string;
  productName: string;
  brand?: string | null;
  verdict: "HAZARD" | "CAUTION" | "SAFE";
  hazardsDetected?: string | null;
  cautionsDetected?: string | null;
  rawOcrText: string;
  ingredientsList?: string | null;
  scannedAt: string;
}

interface InMemoryStore {
  patient: {
    id: string;
    fullName: string;
    dob: string;
    primaryPhysician: string;
    emergencyContact: string;
    notes: string;
  };
  allergies: StoredAllergy[];
  progressionLogs: StoredProgressionLog[];
  scans: StoredScan[];
}

// Clean slate default state - NO pre-filled dummy allergies or names
const memoryStore: InMemoryStore = {
  patient: {
    id: "default-user-profile",
    fullName: "My Health Profile",
    dob: "",
    primaryPhysician: "",
    emergencyContact: "",
    notes: "",
  },
  allergies: [],
  progressionLogs: [],
  scans: [],
};

export async function getPatientWithRelations() {
  try {
    const user = await db.userProfile.findFirst({
      include: {
        allergies: { orderBy: { severity: "desc" } },
        progressionLogs: { orderBy: { eventDate: "desc" } },
        scans: { orderBy: { scannedAt: "desc" }, take: 20 },
      },
    });

    if (user) {
      return user;
    }
  } catch (dbErr) {
    console.warn("Prisma query skipped (serverless clean state):", dbErr);
  }

  // Return clean slate
  return {
    ...memoryStore.patient,
    allergies: memoryStore.allergies,
    progressionLogs: memoryStore.progressionLogs,
    scans: memoryStore.scans,
  };
}

export async function addPatientAllergy(data: {
  name: string;
  category: string;
  severity: string;
  reactionDetails?: string;
  diagnosticType?: string;
  diagnosedDate?: string;
  synonyms?: string[];
}) {
  try {
    let user = await db.userProfile.findFirst();
    if (!user) {
      user = await db.userProfile.create({
        data: {
          fullName: memoryStore.patient.fullName,
          dob: memoryStore.patient.dob || "1995-01-01",
        },
      });
    }

    if (user) {
      const created = await db.allergyItem.create({
        data: {
          userId: user.id,
          name: data.name,
          category: data.category,
          severity: data.severity,
          reactionDetails: data.reactionDetails || "",
          diagnosticType: data.diagnosticType || "CLINICAL_HISTORY",
          diagnosedDate: data.diagnosedDate || new Date().toISOString().split("T")[0],
          synonyms: JSON.stringify(data.synonyms || [data.name]),
          isVerified: true,
        },
      });
      return created;
    }
  } catch (err) {
    console.warn("DB write skipped, saving to memory store:", err);
  }

  const newAllergy: StoredAllergy = {
    id: `allergy-${Date.now()}`,
    userId: memoryStore.patient.id,
    name: data.name,
    category: data.category as any,
    severity: data.severity as any,
    reactionDetails: data.reactionDetails || "",
    diagnosticType: data.diagnosticType || "CLINICAL_HISTORY",
    diagnosedDate: data.diagnosedDate || new Date().toISOString().split("T")[0],
    synonyms: JSON.stringify(data.synonyms || [data.name]),
    isVerified: true,
  };
  memoryStore.allergies.unshift(newAllergy);
  return newAllergy;
}

export async function deletePatientAllergy(id: string) {
  try {
    await db.allergyItem.delete({ where: { id } });
  } catch (err) {
    console.warn("DB delete skipped, removing from memory store:", err);
  }
  memoryStore.allergies = memoryStore.allergies.filter((a) => a.id !== id);
  return true;
}

export async function updatePatientProfile(profileData: any) {
  try {
    const user = await db.userProfile.findFirst();
    if (user) {
      return await db.userProfile.update({
        where: { id: user.id },
        data: profileData,
      });
    }
  } catch (err) {
    console.warn("DB profile update skipped, updating memory store:", err);
  }
  memoryStore.patient = { ...memoryStore.patient, ...profileData };
  return memoryStore.patient;
}

export async function resetAllUserData() {
  try {
    await db.allergyItem.deleteMany({});
    await db.progressionLog.deleteMany({});
    await db.scanHistory.deleteMany({});
  } catch (err) {
    console.warn("DB reset skipped:", err);
  }
  memoryStore.patient = {
    id: "default-user-profile",
    fullName: "My Health Profile",
    dob: "",
    primaryPhysician: "",
    emergencyContact: "",
    notes: "",
  };
  memoryStore.allergies = [];
  memoryStore.progressionLogs = [];
  memoryStore.scans = [];
  return true;
}

export async function loadDemoUserData() {
  memoryStore.patient = {
    ...INITIAL_PATIENT.profile,
    id: "patient-elena-vance-demo",
  };
  memoryStore.allergies = INITIAL_PATIENT.allergies.map((a, i) => ({
    ...a,
    id: `demo-allergy-${i + 1}`,
    userId: "patient-elena-vance-demo",
    synonyms: JSON.stringify(a.synonyms),
  }));
  memoryStore.progressionLogs = INITIAL_PATIENT.progressionLogs.map((p, i) => ({
    ...p,
    id: `demo-prog-${i + 1}`,
    userId: "patient-elena-vance-demo",
  }));
  memoryStore.scans = INITIAL_PATIENT.scans.map((s, i) => ({
    ...s,
    id: `demo-scan-${i + 1}`,
    userId: "patient-elena-vance-demo",
    scannedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    hazardsDetected: JSON.stringify(s.hazardsDetected),
    cautionsDetected: JSON.stringify(s.cautionsDetected),
    ingredientsList: JSON.stringify(s.ingredientsList),
  }));
  return getPatientWithRelations();
}

export async function getProgressionLogsList() {
  try {
    const logs = await db.progressionLog.findMany({
      orderBy: { eventDate: "desc" },
    });
    if (logs && logs.length > 0) return logs;
  } catch (err) {
    console.warn("DB get logs skipped:", err);
  }
  return memoryStore.progressionLogs;
}

export async function addProgressionLogEntry(data: any) {
  try {
    let user = await db.userProfile.findFirst();
    if (!user) {
      user = await db.userProfile.create({
        data: { fullName: "My Health Profile", dob: "1995-01-01" },
      });
    }
    if (user) {
      return await db.progressionLog.create({
        data: {
          userId: user.id,
          eventDate: data.eventDate,
          season: data.season,
          year: data.year,
          allergenName: data.allergenName,
          reactionType: data.reactionType,
          severity: data.severity,
          intervention: data.intervention,
          environmentalFactors: data.environmentalFactors,
          notes: data.notes,
        },
      });
    }
  } catch (err) {
    console.warn("DB log create skipped:", err);
  }

  const newLog: StoredProgressionLog = {
    id: `prog-${Date.now()}`,
    userId: memoryStore.patient.id,
    ...data,
  };
  memoryStore.progressionLogs.unshift(newLog);
  return newLog;
}

export async function getScanHistoryList(verdictFilter?: string | null) {
  try {
    const where: any = {};
    if (verdictFilter && verdictFilter !== "ALL") where.verdict = verdictFilter;
    const scans = await db.scanHistory.findMany({
      where,
      orderBy: { scannedAt: "desc" },
    });
    if (scans && scans.length > 0) return scans;
  } catch (err) {
    console.warn("DB get scans skipped:", err);
  }

  return verdictFilter && verdictFilter !== "ALL"
    ? memoryStore.scans.filter((s) => s.verdict === verdictFilter)
    : memoryStore.scans;
}

export async function addScanHistoryEntry(data: any) {
  try {
    let user = await db.userProfile.findFirst();
    if (!user) {
      user = await db.userProfile.create({
        data: { fullName: "My Health Profile", dob: "1995-01-01" },
      });
    }
    if (user) {
      const created = await db.scanHistory.create({
        data: {
          userId: user.id,
          productName: data.productName,
          brand: data.brand,
          verdict: data.verdict,
          hazardsDetected: JSON.stringify(data.hazardsDetected || []),
          cautionsDetected: JSON.stringify(data.cautionsDetected || []),
          rawOcrText: data.rawOcrText || "",
          ingredientsList: JSON.stringify(data.ingredientsList || []),
        },
      });
      return created.id;
    }
  } catch (err) {
    console.warn("DB add scan skipped:", err);
  }

  const newId = `scan-${Date.now()}`;
  const newScan: StoredScan = {
    id: newId,
    userId: memoryStore.patient.id,
    productName: data.productName,
    brand: data.brand,
    verdict: data.verdict,
    hazardsDetected: JSON.stringify(data.hazardsDetected || []),
    cautionsDetected: JSON.stringify(data.cautionsDetected || []),
    rawOcrText: data.rawOcrText || "",
    ingredientsList: JSON.stringify(data.ingredientsList || []),
    scannedAt: new Date().toISOString(),
  };
  memoryStore.scans.unshift(newScan);
  return newId;
}

export async function deleteScanHistoryEntry(id: string) {
  try {
    await db.scanHistory.delete({ where: { id } });
  } catch (err) {
    console.warn("DB delete scan skipped:", err);
  }
  memoryStore.scans = memoryStore.scans.filter((s) => s.id !== id);
  return true;
}
