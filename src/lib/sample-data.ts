export interface SeedPatientData {
  profile: {
    fullName: string;
    dob: string;
    primaryPhysician: string;
    emergencyContact: string;
    notes: string;
  };
  allergies: {
    name: string;
    category: "FOOD" | "ENVIRONMENTAL" | "MEDICATION" | "CONTACT";
    severity: "MILD" | "MODERATE" | "HIGH" | "ANAPHYLACTIC";
    diagnosedDate: string;
    diagnosticType: string;
    reactionDetails: string;
    synonyms: string[];
    isVerified: boolean;
  }[];
  progressionLogs: {
    eventDate: string;
    season: "SPRING" | "SUMMER" | "FALL" | "WINTER";
    year: number;
    allergenName: string;
    reactionType: string;
    severity: "MILD" | "MODERATE" | "SEVERE" | "LIFE_THREATENING";
    intervention: string;
    environmentalFactors: string;
    notes: string;
  }[];
  scans: {
    productName: string;
    brand: string;
    verdict: "HAZARD" | "CAUTION" | "SAFE";
    hazardsDetected: string[];
    cautionsDetected: string[];
    rawOcrText: string;
    ingredientsList: string[];
  }[];
}

export const INITIAL_PATIENT: SeedPatientData = {
  profile: {
    fullName: "Elena Vance",
    dob: "1997-04-14",
    primaryPhysician: "Dr. Marcus Thorne, MD (Stanford Allergy & Immunology)",
    emergencyContact: "David Vance (Spouse) - +1 (555) 382-9011",
    notes: "Carries twin-pack EpiPen 0.3mg auto-injectors at all times. Severe history of systemic peanut anaphylaxis and secondary oral allergy syndrome to stone fruits."
  },
  allergies: [
    {
      name: "Peanut",
      category: "FOOD",
      severity: "ANAPHYLACTIC",
      diagnosedDate: "2015-08-20",
      diagnosticType: "IGE_BLOOD",
      reactionDetails: "Biphasic anaphylaxis, generalized urticaria, wheezing, hypotension within 10 minutes of exposure.",
      synonyms: ["Peanuts", "Arachis", "Groundnut", "Peanut oil"],
      isVerified: true
    },
    {
      name: "Tree Nuts",
      category: "FOOD",
      severity: "HIGH",
      diagnosedDate: "2017-03-12",
      diagnosticType: "SKIN_PRICK",
      reactionDetails: "High sensitivity to Cashew (Ana o 3) and Walnut. Causes throat tightness, periorbital edema, and nausea.",
      synonyms: ["Cashew", "Walnut", "Almond", "Pistachio", "Hazelnut"],
      isVerified: true
    },
    {
      name: "Milk & Dairy",
      category: "FOOD",
      severity: "MODERATE",
      diagnosedDate: "2019-11-04",
      diagnosticType: "IGE_BLOOD",
      reactionDetails: "Moderate intolerance/allergy to whey and casein. Ingestion leads to severe cramping, urticaria, and oral burning.",
      synonyms: ["Dairy", "Casein", "Whey", "Lactose-free milk solids"],
      isVerified: true
    },
    {
      name: "Birch Pollen (Bet v 1)",
      category: "ENVIRONMENTAL",
      severity: "MILD",
      diagnosedDate: "2020-04-18",
      diagnosticType: "SKIN_PRICK",
      reactionDetails: "Seasonal rhinoconjunctivitis during March-May; oral allergy syndrome (OAS) tingling to raw apples and peaches.",
      synonyms: ["Betula", "Spring tree pollen"],
      isVerified: true
    },
    {
      name: "Penicillin & Beta-Lactams",
      category: "MEDICATION",
      severity: "HIGH",
      diagnosedDate: "2012-06-10",
      diagnosticType: "CLINICAL_HISTORY",
      reactionDetails: "Diffuse maculopapular rash and angioedema after second day of oral Amoxicillin course.",
      synonyms: ["Amoxicillin", "Ampicillin", "Augmentin"],
      isVerified: true
    }
  ],
  progressionLogs: [
    {
      eventDate: "2021-04-12",
      season: "SPRING",
      year: 2021,
      allergenName: "Peanut",
      reactionType: "Systemic Anaphylaxis & Laryngeal Edema",
      severity: "LIFE_THREATENING",
      intervention: "Intramuscular Epinephrine 0.3mg x1, Emergency Dept Transfer, IV Diphenhydramine & Solu-Medrol",
      environmentalFactors: "High regional pollen index (9.4). Accidental ingestion of restaurant satay with unlisted peanut paste.",
      notes: "Symptoms began within 4 minutes. Required 4 hours of post-stabilization observation for biphasic reaction monitoring."
    },
    {
      eventDate: "2022-07-28",
      season: "SUMMER",
      year: 2022,
      allergenName: "Birch Pollen Cross-Reaction (Raw Peach)",
      reactionType: "Oral Allergy Syndrome & Lip Angioedema",
      severity: "MILD",
      intervention: "Oral Cetirizine 10mg, mouth rinse with cold saline, rested for 45 min",
      environmentalFactors: "Dry warm conditions. Reaction triggered by unpeeled raw stone fruit.",
      notes: "Cooked peach preserves did not elicit symptoms (thermolabile Bet v 1 homologous protein degraded by heat)."
    },
    {
      eventDate: "2023-10-15",
      season: "FALL",
      year: 2023,
      allergenName: "Milk & Dairy (Whey Concentrate)",
      reactionType: "Acute Gastrointestinal Distress & Truncal Urticaria",
      severity: "MODERATE",
      intervention: "Diphenhydramine 50mg, hydration, famotidine 20mg",
      environmentalFactors: "Post-workout recovery smoothie containing hidden whey protein concentrate.",
      notes: "Label claimed 'Natural Protein Blend'. Resolved after 3 hours without epinephrine requirement."
    },
    {
      eventDate: "2024-04-02",
      season: "SPRING",
      year: 2024,
      allergenName: "Birch Pollen (Bet v 1)",
      reactionType: "Severe Seasonal Rhinoconjunctivitis & Dyspnea",
      severity: "MODERATE",
      intervention: "Fluticasone propionate nasal spray, Olopatadine ophthalmic drops, HEPA air purification",
      environmentalFactors: "Record early spring pollen surge (11.8 grains/m3 tree count).",
      notes: "Symptoms managed with daily prophylactic intranasal corticosteroids throughout high-count window."
    },
    {
      eventDate: "2025-01-19",
      season: "WINTER",
      year: 2025,
      allergenName: "Tree Nuts (Cashew)",
      reactionType: "Perioral Pruritus, Mild Stridor, Abdominal Cramping",
      severity: "SEVERE",
      intervention: "Prompt Epinephrine 0.3mg administered at onset of voice hoarseness; oral antihistamine follow-up",
      environmentalFactors: "Indoor dinner party; vegan cheese dip prepared with cashew cream base.",
      notes: "Self-administered EpiPen within 7 minutes. Symptoms reversed rapidly without rebound."
    }
  ],
  scans: [
    {
      productName: "Apex Protein Crunch Bar",
      brand: "VitalLife Foods",
      verdict: "HAZARD",
      hazardsDetected: ["Milk & Dairy (Whey Protein Isolate)"],
      cautionsDetected: ["May contain peanuts and tree nuts"],
      rawOcrText: "INGREDIENTS: Whey protein isolate, milk protein crisps, chicory root fiber, dark chocolate coating (sugar, cocoa butter, whole milk powder, sunflower lecithin), natural vanilla flavor, sea salt. ALLERGEN ADVISORY: Manufactured on shared equipment that processes peanuts, cashews, and wheat.",
      ingredientsList: ["Whey protein isolate", "milk protein crisps", "chicory root fiber", "dark chocolate coating", "whole milk powder", "sunflower lecithin", "natural vanilla flavor", "sea salt"]
    },
    {
      productName: "Artisanal Sesame Crackers",
      brand: "Rustic Bakery",
      verdict: "CAUTION",
      hazardsDetected: [],
      cautionsDetected: ["Made in a facility that handles peanuts and tree nuts"],
      rawOcrText: "INGREDIENTS: Organic wheat flour, stone ground whole wheat, filtered water, expeller pressed olive oil, toasted sesame seeds, grey sea salt. ALLERGY WARNING: Packaged in a facility that also processes peanuts, walnuts, and almonds.",
      ingredientsList: ["Organic wheat flour", "stone ground whole wheat", "filtered water", "expeller pressed olive oil", "toasted sesame seeds", "grey sea salt"]
    },
    {
      productName: "Organic Berry Chia Granola",
      brand: "Pure Harvest Co.",
      verdict: "SAFE",
      hazardsDetected: [],
      cautionsDetected: [],
      rawOcrText: "INGREDIENTS: Certified gluten-free rolled oats, maple syrup, virgin coconut oil, chia seeds, dried wild blueberries, pumpkin seeds, freeze-dried raspberries, pink Himalayan sea salt. 100% Dedicated Peanut-Free, Dairy-Free, and Nut-Free Facility.",
      ingredientsList: ["Gluten-free rolled oats", "maple syrup", "virgin coconut oil", "chia seeds", "dried wild blueberries", "pumpkin seeds", "freeze-dried raspberries", "pink Himalayan sea salt"]
    }
  ]
};

export const SAMPLE_LAB_REPORTS = [
  {
    id: "sample-quest-ige",
    title: "ImmunoCAP Specific IgE Allergen Profile",
    labName: "Quest Diagnostics - Specialized Allergy Immunology",
    testDate: "2026-03-14",
    testType: "BLOOD_IGE",
    description: "Multi-analyte quantitative in vitro fluoroenzyme immunoassay measuring allergen-specific human IgE in serum.",
    sampleImageName: "quest_diagnostics_report.png",
    items: [
      {
        biomarker: "Peanut (f13)",
        category: "FOOD",
        measuredValue: 48.6,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "VERY_HIGH",
        interpretation: "Class V - Extremely high specific IgE concentration. Strong correlation with clinical anaphylactic reactivity."
      },
      {
        biomarker: "Peanut Component rAra h 2 (f423)",
        category: "FOOD",
        measuredValue: 36.2,
        unit: "kU/L",
        referenceRange: "< 0.10 kU/L",
        severity: "VERY_HIGH",
        interpretation: "Class V - Major 2S albumin storage protein. Highly predictive of systemic, life-threatening anaphylaxis."
      },
      {
        biomarker: "Cashew Nut (f202)",
        category: "FOOD",
        measuredValue: 18.4,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "HIGH",
        interpretation: "Class IV - High specific IgE. Patient is at significant risk for acute clinical hypersensitivity."
      },
      {
        biomarker: "Cow's Milk (f2)",
        category: "FOOD",
        measuredValue: 4.8,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "MODERATE",
        interpretation: "Class III - Moderate specific IgE. Consistent with persistent IgE-mediated dairy sensitivity."
      },
      {
        biomarker: "Casein (f78)",
        category: "FOOD",
        measuredValue: 3.9,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "MODERATE",
        interpretation: "Class III - Heat-stable protein marker. Indicates risk for reaction to both baked and fresh dairy products."
      },
      {
        biomarker: "Birch Tree (t3) / Bet v 1",
        category: "ENVIRONMENTAL",
        measuredValue: 7.2,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "MODERATE",
        interpretation: "Class III - Clinically relevant seasonal aeroallergen; primary driver of secondary Pollen Food Allergy Syndrome (PFAS)."
      },
      {
        biomarker: "Egg White (f1)",
        category: "FOOD",
        measuredValue: 0.22,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "NEGATIVE",
        interpretation: "Class 0 - Below detection limit for clinical sensitization. Safe for standard dietary consumption."
      },
      {
        biomarker: "Soybean (f14)",
        category: "FOOD",
        measuredValue: 0.18,
        unit: "kU/L",
        referenceRange: "< 0.35 kU/L",
        severity: "NEGATIVE",
        interpretation: "Class 0 - Undetectable specific IgE."
      }
    ]
  },
  {
    id: "sample-spt-percutaneous",
    title: "Percutaneous Skin Prick Test (SPT) Panel",
    labName: "Stanford Medicine - Allergy & Clinical Immunology",
    testDate: "2025-11-08",
    testType: "SKIN_PRICK",
    description: "Standardized bifurcation puncture test with 15-minute wheal and flare measurement relative to histamine control.",
    sampleImageName: "skin_prick_test_report.png",
    items: [
      {
        biomarker: "Histamine Control (Positive)",
        category: "CONTROL",
        measuredValue: 6.5,
        unit: "mm wheal",
        referenceRange: ">= 3.0 mm",
        severity: "CONTROL_VALID",
        interpretation: "Normal cutaneous mast cell reactivity verified."
      },
      {
        biomarker: "Saline Glycerin (Negative)",
        category: "CONTROL",
        measuredValue: 0.0,
        unit: "mm wheal",
        referenceRange: "0.0 mm",
        severity: "CONTROL_VALID",
        interpretation: "No baseline dermatographism observed."
      },
      {
        biomarker: "Peanut Extract",
        category: "FOOD",
        measuredValue: 12.0,
        unit: "mm wheal",
        referenceRange: "< 3.0 mm",
        severity: "VERY_HIGH",
        interpretation: "Massive positive wheal with pseudopod extension (12x18 mm flare). Direct confirmation of clinical reactivity."
      },
      {
        biomarker: "Walnut Extract",
        category: "FOOD",
        measuredValue: 8.5,
        unit: "mm wheal",
        referenceRange: "< 3.0 mm",
        severity: "HIGH",
        interpretation: "Positive reaction exceeding positive control threshold."
      },
      {
        biomarker: "Birch Pollen Extract",
        category: "ENVIRONMENTAL",
        measuredValue: 5.5,
        unit: "mm wheal",
        referenceRange: "< 3.0 mm",
        severity: "MODERATE",
        interpretation: "Positive aeroallergen sensitization."
      },
      {
        biomarker: "Almond Extract",
        category: "FOOD",
        measuredValue: 4.0,
        unit: "mm wheal",
        referenceRange: "< 3.0 mm",
        severity: "MODERATE",
        interpretation: "Moderate positive reaction."
      },
      {
        biomarker: "Dermatophagoides pteronyssinus (Dust Mite)",
        category: "ENVIRONMENTAL",
        measuredValue: 1.0,
        unit: "mm wheal",
        referenceRange: "< 3.0 mm",
        severity: "NEGATIVE",
        interpretation: "Negative response below 3mm clinical significance cut-off."
      }
    ]
  }
];

export const SAMPLE_PRODUCTS_TO_SCAN = [
  {
    id: "bar-whey-peanut-advisory",
    name: "Apex Velocity High-Protein Nut Bar",
    brand: "Apex Performance Nutrition",
    type: "Protein Bar",
    imagePreview: "protein_bar_label.png",
    rawIngredients: `INGREDIENTS: Whey protein isolate (milk), almonds, tapioca fiber syrup, dark chocolate coating (unsweetened chocolate, cane sugar, cocoa butter, milk fat), chicory root fiber, organic sunflower lecithin, sea salt, natural flavors.
ALLERGY ADVISORY: Contains Milk, Almonds. Manufactured in a dedicated facility that also handles Peanuts, Cashews, and Wheat.`
  },
  {
    id: "snack-peanuts-direct",
    name: "Thai Spiced Crunch Snack Mix",
    brand: "Pacific Flavors Co.",
    type: "Snack Mix",
    imagePreview: "thai_snack_label.png",
    rawIngredients: `INGREDIENTS: Roasted peanuts (peanuts, arachis oil, sea salt), crisped rice, sesame seeds, coconut chips, cane sugar, chili powder, lemongrass extract, citric acid.
CONTAINS: PEANUTS, SESAME.`
  },
  {
    id: "creamer-almond-cashew",
    name: "Artisan Plant-Based Creamer",
    brand: "Verdant Kitchens",
    type: "Beverage",
    imagePreview: "creamer_label.png",
    rawIngredients: `INGREDIENTS: Filtered spring water, organic cashew paste, organic almond butter, organic coconut sugar, dipotassium phosphate, organic acacia gum, gellan gum, organic vanilla extract.
CONTAINS: TREE NUTS (CASHEWS, ALMONDS).`
  },
  {
    id: "pure-safe-crackers",
    name: "Seven-Seed Artisan Sea Salt Flatbread",
    brand: "Simple Hearth Bakery",
    type: "Baked Snack",
    imagePreview: "safe_crackers_label.png",
    rawIngredients: `INGREDIENTS: Water, organic brown rice flour, potato starch, organic sunflower seeds, organic pumpkin seeds, organic chia seeds, extra virgin olive oil, golden flaxseeds, pink salt.
GUARANTEE: 100% Free from Peanuts, Tree Nuts, Dairy, Eggs, Soy, Wheat, and Fish. Produced in a certified allergen-controlled facility.`
  }
];
