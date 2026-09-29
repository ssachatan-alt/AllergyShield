export interface AllergenRule {
  id: string;
  canonicalName: string;
  category: "FOOD" | "ENVIRONMENTAL" | "MEDICATION" | "CONTACT";
  synonyms: string[];
  hiddenDerivatives: string[];
  cautionTriggers: string[];
  crossReactivities?: string[];
  description: string;
}

export const MASTER_ALLERGEN_REGISTRY: AllergenRule[] = [
  {
    id: "peanuts",
    canonicalName: "Peanut",
    category: "FOOD",
    synonyms: ["peanuts", "peanut", "groundnut", "ground nuts", "arachis", "beer nuts", "monkey nuts", "arachis hypogaea", "cacahuate", "goober"],
    hiddenDerivatives: [
      "peanut oil",
      "arachis oil",
      "peanut flour",
      "peanut butter",
      "hydrolyzed peanut protein",
      "peanut meal",
      "defatted peanut flour",
      "mixed nuts",
      "satay sauce"
    ],
    cautionTriggers: ["may contain peanuts", "processed in a facility that handles peanuts", "traces of peanuts", "shared peanut equipment"],
    crossReactivities: ["Lupin", "Soybeans", "Green peas", "Other legumes"],
    description: "High-risk allergen capable of causing severe IgE-mediated reactions and systemic anaphylaxis."
  },
  {
    id: "tree-nuts",
    canonicalName: "Tree Nuts",
    category: "FOOD",
    synonyms: [
      "tree nut", "tree nuts", "almond", "walnut", "cashew", "pecan", "pistachio",
      "hazelnut", "filbert", "macadamia", "brazil nut", "pine nut", "pignoli", "chestnut"
    ],
    hiddenDerivatives: [
      "marzipan",
      "almond paste",
      "praline",
      "gianduja",
      "nougat",
      "almond meal",
      "cashew butter",
      "pesto",
      "nut butter",
      "nut milk",
      "amaretto flavor",
      "walnut oil",
      "macadamia oil"
    ],
    cautionTriggers: ["may contain tree nuts", "manufactured on equipment that processes nuts", "traces of nuts"],
    crossReactivities: ["Birch pollen (secondary oral allergy syndrome with hazelnuts)", "Pink peppercorn (cashew cross-reactivity)"],
    description: "Diverse botanical nut proteins including 2S albumins and 11S globulins with persistent lifelong reactivity."
  },
  {
    id: "dairy",
    canonicalName: "Milk & Dairy",
    category: "FOOD",
    synonyms: ["milk", "dairy", "cow's milk", "bovine milk", "cream", "butter", "cheese", "yogurt"],
    hiddenDerivatives: [
      "casein",
      "sodium caseinate",
      "calcium caseinate",
      "whey",
      "whey protein isolate",
      "whey protein concentrate",
      "delactosed whey",
      "lactalbumin",
      "lactoglobulin",
      "curds",
      "ghee",
      "butterfat",
      "milk solids",
      "nonfat dry milk",
      "rennet casein",
      "koumiss",
      "recast casein"
    ],
    cautionTriggers: ["may contain milk", "processed on lines handling dairy", "contains milk ingredients"],
    crossReactivities: ["Goat milk", "Sheep milk", "Beef (rare BSA cross-sensitization)"],
    description: "Includes both heat-stable caseins and heat-labile whey proteins (alpha-lactalbumin and beta-lactoglobulin)."
  },
  {
    id: "egg",
    canonicalName: "Egg",
    category: "FOOD",
    synonyms: ["egg", "eggs", "egg white", "egg yolk", "whole egg", "poultry egg"],
    hiddenDerivatives: [
      "albumin",
      "ovalbumin",
      "ovomucoid",
      "ovotransferrin",
      "lysozyme",
      "globulin",
      "vitellin",
      "livetin",
      "meringue",
      "surimi",
      "mayonnaise",
      "lecithin (egg)",
      "egg powder"
    ],
    cautionTriggers: ["may contain egg", "processed in an egg-processing facility", "traces of egg"],
    crossReactivities: ["Bird-egg syndrome (feather exposure inducing egg yolk reactivity)", "Quail egg", "Duck egg"],
    description: "Ovomucoid is remarkably heat and digestive protease-resistant, often predicting persistent clinical allergy."
  },
  {
    id: "wheat-gluten",
    canonicalName: "Wheat & Gluten",
    category: "FOOD",
    synonyms: ["wheat", "gluten", "durum", "semolina", "spelt", "farro", "kamut", "emmer", "triticale", "einkorn"],
    hiddenDerivatives: [
      "vital wheat gluten",
      "seitan",
      "graham flour",
      "bulgur",
      "couscous",
      "wheat bran",
      "wheat germ",
      "hydrolyzed wheat protein",
      "wheat starch",
      "barley malt",
      "malt extract",
      "rye flour",
      "modified food starch (wheat-derived)",
      "dextrin (wheat)"
    ],
    cautionTriggers: ["may contain wheat", "may contain gluten", "processed on lines that process wheat"],
    crossReactivities: ["Barley", "Rye", "Grass pollen (Tri a 30 / Omega-5 gliadin in WDEIA)"],
    description: "Can manifest as classic IgE-mediated anaphylaxis, wheat-dependent exercise-induced anaphylaxis (WDEIA), or celiac enteropathy."
  },
  {
    id: "soy",
    canonicalName: "Soy & Soybeans",
    category: "FOOD",
    synonyms: ["soy", "soya", "soybean", "soybeans", "edamame"],
    hiddenDerivatives: [
      "soy lecithin",
      "textured vegetable protein",
      "tvp",
      "tofu",
      "miso",
      "natto",
      "shoyu",
      "tamari",
      "tempeh",
      "soy protein isolate",
      "soy sauce",
      "yuba",
      "hydrolyzed soy protein"
    ],
    cautionTriggers: ["may contain soy", "produced in a facility using soy", "traces of soy"],
    crossReactivities: ["Birch pollen (Gly m 4 Oral Allergy Syndrome)", "Peanuts", "Legumes"],
    description: "Storage globulins (Gly m 5, Gly m 6) correlate with severe systemic reactions, while Gly m 4 triggers pollen-food syndrome."
  },
  {
    id: "shellfish",
    canonicalName: "Crustacean & Shellfish",
    category: "FOOD",
    synonyms: [
      "shellfish", "crustacean", "shrimp", "prawn", "crab", "lobster",
      "crawfish", "clam", "mussel", "oyster", "scallop", "squid", "calamari", "octopus"
    ],
    hiddenDerivatives: [
      "glucosamine",
      "chitin",
      "krill oil",
      "oyster sauce",
      "shrimp paste",
      "belacan",
      "fish sauce (with shellfish)",
      "bouillabaisse base",
      "surimi"
    ],
    cautionTriggers: ["may contain shellfish", "traces of crustaceans", "facility handles seafood"],
    crossReactivities: ["House dust mite (tropomyosin cross-reactivity)", "Cockroach (Bla g 7)", "Insects/Mealworms"],
    description: "Tropomyosin is the pan-allergen responsible for high rates of severe, long-persisting adult-onset hypersensitivity."
  },
  {
    id: "sesame",
    canonicalName: "Sesame",
    category: "FOOD",
    synonyms: ["sesame", "sesame seed", "sesamum indicum", "benne", "gingelly", "til"],
    hiddenDerivatives: [
      "tahini",
      "tahina",
      "sesame oil",
      "sesamol",
      "sesamolin",
      "halvah",
      "gomasio",
      "hummus (due to tahini)",
      "za'atar"
    ],
    cautionTriggers: ["may contain sesame", "packed in a facility handling sesame", "traces of sesame"],
    crossReactivities: ["Poppy seed", "Kiwi", "Rape seed"],
    description: "FDA-mandated major allergen (FASTER Act). Oleosins and seed storage proteins frequently induce anaphylaxis."
  },
  {
    id: "birch-pollen",
    canonicalName: "Birch Pollen (Bet v 1)",
    category: "ENVIRONMENTAL",
    synonyms: ["birch", "birch tree", "betula", "bet v 1", "spring tree pollen"],
    hiddenDerivatives: [],
    cautionTriggers: ["high spring pollen count", "flowering birch trees"],
    crossReactivities: ["Raw Apple (Mal d 1)", "Peach (Pru p 1)", "Cherry", "Plum", "Carrot (Dau c 1)", "Celery (Api g 1)", "Hazelnut (Cor a 1.04)"],
    description: "Causes severe seasonal rhinoconjunctivitis and Pollen Food Allergy Syndrome (PFAS) due to PR-10 protein homology."
  },
  {
    id: "penicillin",
    canonicalName: "Penicillin & Beta-Lactams",
    category: "MEDICATION",
    synonyms: ["penicillin", "penicillin g", "penicillin v", "amoxicillin", "ampicillin", "augmentin", "piperacillin", "clavulanate"],
    hiddenDerivatives: [
      "amoxicillin-clavulanate",
      "ampicillin-sulbactam",
      "cephalosporin",
      "cephalexin",
      "cefuroxime",
      "ceftriaxone",
      "piperacillin-tazobactam"
    ],
    cautionTriggers: ["beta-lactam antibiotic warning", "contains penicillin derivatives"],
    crossReactivities: ["Cephalosporins (variable depending on R1 side-chain sharing)", "Carbapenems (<1%)"],
    description: "IgE-mediated immediate hypersensitivity against major penicilloyl determinants or minor haptenic conjugates."
  },
  {
    id: "nickel",
    canonicalName: "Nickel & Metal Contact",
    category: "CONTACT",
    synonyms: ["nickel", "nickel sulfate", "metallic nickel"],
    hiddenDerivatives: [
      "costume jewelry",
      "stainless steel with high nickel release",
      "belt buckles",
      "eyeglass frames",
      "orthodontic wire"
    ],
    cautionTriggers: ["contains nickel", "plated alloy"],
    crossReactivities: ["Cobalt chloride", "Chromium"],
    description: "Type IV delayed-type cell-mediated contact hypersensitivity presenting with persistent vesicular eczema."
  }
];

export interface IngredientMatchResult {
  status: "HAZARD" | "CAUTION" | "SAFE";
  matchedHazards: {
    allergenName: string;
    triggerWord: string;
    severity: string;
    reason: string;
  }[];
  cautionAlerts: {
    triggerWord: string;
    context: string;
    reason: string;
  }[];
  parsedTokens: string[];
  safeIngredients: string[];
}

/**
 * Analyzes ingredient text against a patient's active allergies list.
 */
export function analyzeIngredients(
  ocrText: string,
  userAllergies: { name: string; severity: string; category?: string }[]
): IngredientMatchResult {
  const normalizedText = ocrText.toLowerCase();
  
  // Clean tokens from raw text
  // Split on commas, semicolons, parentheses, bullets, or newlines
  const rawTokens = normalizedText
    .split(/[,;:\n•·\(\)\[\]\/\\]+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !t.startsWith("ingredients") && !t.startsWith("contains"));

  const matchedHazards: IngredientMatchResult["matchedHazards"] = [];
  const cautionAlerts: IngredientMatchResult["cautionAlerts"] = [];
  const safeTokens: string[] = [];

  // 0. Strip negative allergen guarantee claims to prevent false-positive hazard matches
  // e.g. "100% Free from Peanuts, Tree Nuts, Dairy", "Does not contain peanuts", "Certified peanut-free"
  let textForHazardScanning = normalizedText;
  const negativeClaims = [
    /(?:100%\s+)?free\s+from\s+[^.;\n]+/gi,
    /does\s+not\s+contain\s+[^.;\n]+/gi,
    /guarantee:\s*[^.\n]+/gi,
    /certified\s+[^.\n]+-free\s+facility/gi,
    /\b(?:peanut|nut|dairy|gluten|egg|soy|wheat)-free\b/gi,
  ];

  negativeClaims.forEach((pattern) => {
    textForHazardScanning = textForHazardScanning.replace(pattern, " [negative-claim-cleared] ");
  });

  // 1. Check for cross-contamination warning phrases ("May contain", "Produced in a facility...")
  const cautionPatterns = [
    { regex: /may contain\s+([^.;\n]+)/i, label: "May contain statement" },
    { regex: /manufactured (?:in|on|at|by)\s+([^.;\n]+)/i, label: "Facility processing advisory" },
    { regex: /processed (?:in|on)\s+([^.;\n]+)/i, label: "Shared line advisory" },
    { regex: /traces of\s+([^.;\n]+)/i, label: "Trace exposure advisory" },
    { regex: /shared equipment (?:with)?\s+([^.;\n]+)/i, label: "Shared equipment" },
  ];

  cautionPatterns.forEach(pattern => {
    const match = normalizedText.match(pattern.regex);
    if (match) {
      const cautionSnippet = match[0];
      // Check if any of the patient's allergens appear in this caution snippet
      userAllergies.forEach(userAllergy => {
        const regEntry = MASTER_ALLERGEN_REGISTRY.find(
          r => r.canonicalName.toLowerCase() === userAllergy.name.toLowerCase() ||
               r.synonyms.some(s => s.toLowerCase() === userAllergy.name.toLowerCase())
        );

        const checkTerms = regEntry
          ? [regEntry.canonicalName.toLowerCase(), ...regEntry.synonyms, ...regEntry.hiddenDerivatives]
          : [userAllergy.name.toLowerCase()];

        const foundTerm = checkTerms.find(term => cautionSnippet.includes(term));
        if (foundTerm) {
          cautionAlerts.push({
            triggerWord: foundTerm,
            context: cautionSnippet,
            reason: `Advisory warning detected: "${cautionSnippet}". Potential risk for patients with ${userAllergy.severity.toLowerCase()} ${userAllergy.name} allergy.`
          });
        }
      });
    }
  });

  // 2. Exact & Derivative Matching against user's specific allergy profile
  userAllergies.forEach(userAllergy => {
    const regEntry = MASTER_ALLERGEN_REGISTRY.find(
      r => r.canonicalName.toLowerCase() === userAllergy.name.toLowerCase() ||
           r.synonyms.some(s => s.toLowerCase() === userAllergy.name.toLowerCase())
    );

    const checkTerms = regEntry
      ? [
          { term: regEntry.canonicalName.toLowerCase(), isDirect: true },
          ...regEntry.synonyms.map(s => ({ term: s.toLowerCase(), isDirect: true })),
          ...regEntry.hiddenDerivatives.map(d => ({ term: d.toLowerCase(), isDirect: false }))
        ]
      : [{ term: userAllergy.name.toLowerCase(), isDirect: true }];

    checkTerms.forEach(({ term, isDirect }) => {
      // Regex boundary check to avoid partial word mismatches (e.g. "butternut squash" matching "nut")
      const termRegex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      
      // Use textForHazardScanning so "Free from peanuts" does not trigger a hazard!
      if (termRegex.test(textForHazardScanning)) {
        const alreadyHazard = matchedHazards.some(h => h.triggerWord === term);
        if (!alreadyHazard) {
          matchedHazards.push({
            allergenName: userAllergy.name,
            triggerWord: term,
            severity: userAllergy.severity,
            reason: isDirect
              ? `Direct allergen ingredient match: "${term}" directly corresponds to your diagnosed ${userAllergy.name} allergy.`
              : `Derived or hidden ingredient match: "${term}" is a known biochemical derivative / additive of ${userAllergy.name}.`
          });
        }
      }
    });
  });

  // Collect safe tokens
  rawTokens.forEach(token => {
    const isHazard = matchedHazards.some(h => token.includes(h.triggerWord));
    const isCaution = cautionAlerts.some(c => token.includes(c.triggerWord));
    if (!isHazard && !isCaution && token.length > 2) {
      safeTokens.push(token);
    }
  });

  let status: IngredientMatchResult["status"] = "SAFE";
  if (matchedHazards.length > 0) {
    status = "HAZARD";
  } else if (cautionAlerts.length > 0) {
    status = "CAUTION";
  }

  return {
    status,
    matchedHazards,
    cautionAlerts,
    parsedTokens: rawTokens,
    safeIngredients: Array.from(new Set(safeTokens))
  };
}
