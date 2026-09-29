# AllergyShield — Intelligent Allergy Detection & Ingredient Safety Scanner

**AllergyShield** is a production-grade, clinical-grade web application engineered to protect individuals with life-threatening food allergies, environmental hypersensitivities, and drug allergies through intelligent multi-modal OCR scanning, longitudinal progression tracking, and laboratory report digitization.

---

## 🌟 Key Architecture & Capabilities

### 1. Interactive Patient Allergy Profile & Risk Matrix (Module 1)
- **4 Clinical Categories**: Food & Dietary, Environmental / Pollen, Medication & Drugs, and Contact & Cosmetic.
- **Severity Stratification**:
  - 🔴 **Anaphylactic Risk** (High vigilance, life-threatening systemic reactivity)
  - 🟠 **High Risk**
  - 🟡 **Moderate**
  - 🟢 **Mild**
- **Cross-Reactivity Knowledge Graph**:
  - Birch Tree Pollen (*Bet v 1*) $\rightarrow$ Stone Fruit / Apple Oral Allergy Syndrome (PR-10 protein homology)
  - Peanut $\rightarrow$ Lupin & Legume co-sensitization
  - Latex $\rightarrow$ Avocado / Banana / Kiwi syndrome
- **Biochemical Derivative Mapping**: Automatically flags hidden additives such as:
  - *Dairy*: Casein, sodium caseinate, whey protein isolate, lactalbumin, curds, ghee.
  - *Egg*: Ovalbumin, ovomucoid, lysozyme, globulin, vitellin.
  - *Peanut*: Arachis oil, peanut flour, groundnut meal.
  - *Gluten*: Spelt, semolina, durum, farro, kamut, barley malt, triticale.
  - *Soy*: Soy lecithin, textured vegetable protein (TVP), miso, shoyu, edamame.
  - *Shellfish*: Tropomyosin, glucosamine, chitin, krill.

### 2. Physical Lab Report Uploader & OCR Parser (Module 2)
- **Multi-Modal Document Parsing**: Handles messy laboratory printouts (Blood Specific IgE panels and Skin Prick Test sheets) via Gemini Vision / Clinical OCR engine.
- **Side-by-Side Verification Screen**: Displays extracted biomarkers in editable cards allowing patients and clinicians to verify measured concentrations (`kU/L` or `mm wheal`), reference ranges, and severity interpretations before committing.
- **Auto-Sync to Medical Record**: Positively identified biomarkers automatically sync into the patient's active permanent allergy matrix.

### 3. Live Camera / Photo Ingredient Safety Scanner (Module 3)
- **Real-Time Optical Viewfinder**: Built with HTML5 `getUserMedia` camera stream with corner reticle brackets and animated laser scanline HUD.
- **Negative Allergen Claim Protection**: Intelligently ignores false-positive phrases like *"100% Free from Peanuts"* or *"Certified Dairy-Free"*.
- **Instant Visual Verdict**:
  - 🔴 **ALLERGEN HAZARD**: Immediate warning tag identifying exact matching allergens and biochemical derivatives.
  - 🟡 **CAUTION**: Cross-contamination warnings (*"May contain traces of..."*, *"Manufactured in a shared facility..."*).
  - 🟢 **VERIFIED SAFE**: Clean verdict with full parsed ingredient breakdown.
- **Automatic History Logging**: Saves audits directly into SQLite.

### 4. Multi-Year Progression Tracker (Module 1 Part B)
- **Chronological Timeline (2021–2026)**: Tracks allergic episodes, clinical interventions (e.g., EpiPen 0.3mg IM, Solu-Medrol, Antihistamines), and seasonal environmental triggers (e.g., pollen counts $\ge 11.8\text{ grains/m}^3$).
- **Incident Logger**: Record new acute episodes with severity, intervention, and context.

### 5. Emergency Allergy Medical Passport
- Clean, printable emergency summary detailing patient demographics, supervising immunologist, emergency contacts, confirmed anaphylactic triggers, and 4-step emergency epinephrine protocol.

---

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4, Plus Jakarta Sans & Space Grotesk typography
- **Icons & Micro-interactions**: Lucide Icons, Framer Motion
- **Database**: SQLite via Prisma ORM (`prisma/schema.prisma`)
- **Vision & AI**: Google GenAI SDK (`@google/genai`) with `gemini-3.8-flash` & High-Accuracy Clinical Engine Fallback

---

## 🚀 Getting Started

### 1. Install Dependencies & Seed Database
```bash
npm install
npm run seed
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Optional: Configure Live Gemini Vision API Key
Click **Settings** in the top navigation bar to input your Google Gemini API key. If left blank, AllergyShield runs automatically in the built-in clinical fallback engine.
