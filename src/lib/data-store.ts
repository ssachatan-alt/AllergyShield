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
  patient: typeof INITIAL_PATIENT.profile & { id: string };
  allergies: StoredAllergy[];
  progressionLogs: StoredProgressionLog[];
  scans: StoredScan[];
}

const memoryStore: InMemoryStore = {
  patient: {
    ...INITIAL_PATIENT.profile,
    id: "patient-elena-vance-default",
  },
  allergies: INITIAL_PATIENT.allergies.map((a, i) => ({
    ...a,
    id: `allergy-${i + 1}`,
    userId: "patient-elena-vance-default",
    synonyms: JSON.stringify(a.synonyms),
  })),
  progressionLogs: INITIAL_PATIENT.progressionLogs.map((p, i) => ({
    ...p,
    id: `prog-${i + 1}`,
    userId: "patient-elena-vance-default",
  })),
  scans: INITIAL_PATIENT.scans.map((s, i) => ({
    ...s,
    id: `scan-${i + 1}`,
    userId: "patient-elena-vance-default",
    scannedAt: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
    hazardsDetected: JSON.stringify(s.hazardsDetected),
    cautionsDetected: JSON.stringify(s.cautionsDetected),
    ingredientsList: JSON.stringify(s.ingredientsList),
  })),
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

    if (user && user.allergies && user.allergies.length > 0) {
      return user;
    }

    if (!user) {
      try {
        const newUser = await db.userProfile.create({
          data: {
            fullName: INITIAL_PATIENT.profile.fullName,
            dob: INITIAL_PATIENT.profile.dob,
            primaryPhysician: INITIAL_PATIENT.profile.primaryPhysician,
            emergencyContact: INITIAL_PATIENT.profile.emergencyContact,
            notes: INITIAL_PATIENT.profile.notes,
          },
        });

        for (const a of INITIAL_PATIENT.allergies) {
          await db.allergyItem.create({
            data: {
              userId: newUser.id,
              name: a.name,
              category: a.category,
              severity: a.severity,
              diagnosedDate: a.diagnosedDate,
              diagnosticType: a.diagnosticType,
              reactionDetails: a.reactionDetails,
              synonyms: JSON.stringify(a.synonyms),
              isVerified: a.isVerified,
            },
          });
        }

        for (const p of INITIAL_PATIENT.progressionLogs) {
          await db.progressionLog.create({
            data: {
              userId: newUser.id,
              eventDate: p.eventDate,
              season: p.season,
              year: p.year,
              allergenName: p.allergenName,
              reactionType: p.reactionType,
              severity: p.severity,
              intervention: p.intervention,
              environmentalFactors: p.environmentalFactors,
              notes: p.notes,
            },
          });
        }

        const seededUser = await db.userProfile.findFirst({
          where: { id: newUser.id },
          include: {
            allergies: { orderBy: { severity: "desc" } },
            progressionLogs: { orderBy: { eventDate: "desc" } },
            scans: { orderBy: { scannedAt: "desc" } },
          },
        });
        if (seededUser) return seededUser;
      } catch (seedErr) {
        console.warn("DB seed attempt failed (serverless fallback):", seedErr);
      }
    }
  } catch (dbErr) {
    console.warn("Prisma query failed, utilizing resilient serverless store:", dbErr);
  }

  // Resilient fallback for Vercel Serverless
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
    const user = await db.userProfile.findFirst();
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
    console.warn("DB write failed, updating memory store:", err);
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
    return true;
  } catch (err) {
    console.warn("DB delete failed, updating memory store:", err);
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
    console.warn("DB update failed, updating memory store:", err);
  }
  memoryStore.patient = { ...memoryStore.patient, ...profileData };
  return memoryStore.patient;
}

export async function getProgressionLogsList() {
  try {
    const user = await db.userProfile.findFirst();
    if (user) {
      const logs = await db.progressionLog.findMany({
        where: { userId: user.id },
        orderBy: { eventDate: "desc" },
      });
      if (logs.length > 0) return logs;
    }
  } catch (err) {
    console.warn("DB get logs failed:", err);
  }
  return memoryStore.progressionLogs;
}

export async function addProgressionLogEntry(data: any) {
  try {
    const user = await db.userProfile.findFirst();
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
    console.warn("DB log create failed, writing to memory store:", err);
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
    const user = await db.userProfile.findFirst();
    if (user) {
      const where: any = { userId: user.id };
      if (verdictFilter && verdictFilter !== "ALL") where.verdict = verdictFilter;
      const scans = await db.scanHistory.findMany({
        where,
        orderBy: { scannedAt: "desc" },
      });
      if (scans.length > 0) return scans;
    }
  } catch (err) {
    console.warn("DB get scans failed:", err);
  }

  return verdictFilter && verdictFilter !== "ALL"
    ? memoryStore.scans.filter((s) => s.verdict === verdictFilter)
    : memoryStore.scans;
}

export async function addScanHistoryEntry(data: any) {
  try {
    const user = await db.userProfile.findFirst();
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
    console.warn("DB add scan failed:", err);
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
    return true;
  } catch (err) {
    console.warn("DB delete scan failed:", err);
  }
  memoryStore.scans = memoryStore.scans.filter((s) => s.id !== id);
  return true;
}
