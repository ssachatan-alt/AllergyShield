import { PrismaClient } from "@prisma/client";
import { INITIAL_PATIENT } from "../src/lib/sample-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting AllergyShield database seed...");

  // Check if profile exists
  let user = await prisma.userProfile.findFirst();

  if (!user) {
    user = await prisma.userProfile.create({
      data: {
        fullName: INITIAL_PATIENT.profile.fullName,
        dob: INITIAL_PATIENT.profile.dob,
        primaryPhysician: INITIAL_PATIENT.profile.primaryPhysician,
        emergencyContact: INITIAL_PATIENT.profile.emergencyContact,
        notes: INITIAL_PATIENT.profile.notes,
      },
    });
    console.log(`✅ Created patient profile for: ${user.fullName} (${user.id})`);
  }

  // Clear existing items for clean deterministic seed
  await prisma.allergyItem.deleteMany({ where: { userId: user.id } });
  await prisma.progressionLog.deleteMany({ where: { userId: user.id } });
  await prisma.scanHistory.deleteMany({ where: { userId: user.id } });

  // 1. Seed Allergies
  for (const allergy of INITIAL_PATIENT.allergies) {
    await prisma.allergyItem.create({
      data: {
        userId: user.id,
        name: allergy.name,
        category: allergy.category,
        severity: allergy.severity,
        diagnosedDate: allergy.diagnosedDate,
        diagnosticType: allergy.diagnosticType,
        reactionDetails: allergy.reactionDetails,
        synonyms: JSON.stringify(allergy.synonyms),
        isVerified: allergy.isVerified,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_PATIENT.allergies.length} patient allergy matrix records`);

  // 2. Seed Multi-Year Progression Logs
  for (const log of INITIAL_PATIENT.progressionLogs) {
    await prisma.progressionLog.create({
      data: {
        userId: user.id,
        eventDate: log.eventDate,
        season: log.season,
        year: log.year,
        allergenName: log.allergenName,
        reactionType: log.reactionType,
        severity: log.severity,
        intervention: log.intervention,
        environmentalFactors: log.environmentalFactors,
        notes: log.notes,
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_PATIENT.progressionLogs.length} progression reaction events`);

  // 3. Seed Historical Scans
  for (const scan of INITIAL_PATIENT.scans) {
    await prisma.scanHistory.create({
      data: {
        userId: user.id,
        productName: scan.productName,
        brand: scan.brand,
        verdict: scan.verdict,
        hazardsDetected: JSON.stringify(scan.hazardsDetected),
        cautionsDetected: JSON.stringify(scan.cautionsDetected),
        rawOcrText: scan.rawOcrText,
        ingredientsList: JSON.stringify(scan.ingredientsList),
      },
    });
  }
  console.log(`✅ Seeded ${INITIAL_PATIENT.scans.length} historical product scans`);

  console.log("✨ AllergyShield database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
