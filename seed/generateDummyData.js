/**
 * VeinoTronic - Clinically Referenced Dummy Data Generator
 * 
 * Based on: Vein Detection Data Collection Project Requirements
 * 
 * All values are derived from published medical literature ranges for:
 * - Vein depth from skin surface (ultrasound B-mode reference)
 * - Vein diameter (inner lumen)
 * - Visibility scoring (High/Medium/Low)
 * - Vein condition classification
 * - Population-specific parameters
 * 
 * Population Groups:
 *   - Pediatric (0-17)
 *   - Adult (18-64)
 *   - Geriatric (65+)
 *   - Diabetic
 *   - Oncology/Chemotherapy
 *   - Obese (BMI >= 30)
 *   - Morbidly Obese (BMI >= 40)
 *   - Dehydrated
 *   - Neonatal (0-28 days)
 */

// ─── MEDICAL REFERENCE PARAMETERS ──────────────────────────
// These ranges are based on ultrasound studies and clinical literature

const POPULATION_PROFILES = {
  neonatal: {
    ageRange: [0, 0.08], // 0-28 days in years
    bmiRange: [12, 16],
    depthRange: { min: 0.5, max: 2.5, mean: 1.2, sd: 0.4 },
    diameterRange: { min: 0.3, max: 1.5, mean: 0.8, sd: 0.3 },
    visibilityDistribution: { high: 0.10, medium: 0.30, low: 0.60 },
    conditionDistribution: { normal: 0.85, fragile: 0.10, collapsed: 0.05 },
    primarySites: ["dorsal_hand", "scalp", "foot_dorsal"],
    difficultySites: ["forearm", "cubital_fossa"],
    motionArtifact: "high",
    skinToneEffect: "moderate",
    tourniquetBenefit: "minimal",
    failureRate: 0.35,
    notes: "High motion artifact. Very small caliber veins. Scalp veins often preferred.",
  },

  pediatric: {
    ageRange: [1, 17],
    bmiRange: [14, 28],
    depthRange: { min: 1.0, max: 4.0, mean: 2.0, sd: 0.6 },
    diameterRange: { min: 0.8, max: 3.0, mean: 1.8, sd: 0.5 },
    visibilityDistribution: { high: 0.25, medium: 0.45, low: 0.30 },
    conditionDistribution: { normal: 0.90, fragile: 0.05, frequently_cannulated: 0.05 },
    primarySites: ["dorsal_hand", "forearm", "cubital_fossa"],
    difficultySites: ["deep_forearm"],
    motionArtifact: "high",
    skinToneEffect: "low",
    tourniquetBenefit: "moderate",
    failureRate: 0.20,
    notes: "High motion in younger children. Cooperation improves with age.",
  },

  adult: {
    ageRange: [18, 64],
    bmiRange: [18.5, 29.9],
    depthRange: { min: 1.5, max: 5.0, mean: 3.0, sd: 0.8 },
    diameterRange: { min: 1.5, max: 5.5, mean: 3.2, sd: 0.7 },
    visibilityDistribution: { high: 0.50, medium: 0.35, low: 0.15 },
    conditionDistribution: { normal: 0.80, fragile: 0.05, frequently_cannulated: 0.15 },
    primarySites: ["cubital_fossa", "forearm", "dorsal_hand"],
    difficultySites: [],
    motionArtifact: "low",
    skinToneEffect: "variable",
    tourniquetBenefit: "high",
    failureRate: 0.08,
    notes: "Standard population. Best detection rates. Tourniquet significantly improves visibility.",
  },

  geriatric: {
    ageRange: [65, 95],
    bmiRange: [17, 32],
    depthRange: { min: 1.0, max: 4.5, mean: 2.5, sd: 1.0 },
    diameterRange: { min: 1.0, max: 4.0, mean: 2.2, sd: 0.8 },
    visibilityDistribution: { high: 0.20, medium: 0.40, low: 0.40 },
    conditionDistribution: { normal: 0.30, fragile: 0.40, fibrotic: 0.15, frequently_cannulated: 0.15 },
    primarySites: ["forearm", "cubital_fossa", "dorsal_hand"],
    difficultySites: ["dorsal_hand", "forearm"],
    motionArtifact: "low",
    skinToneEffect: "low",
    tourniquetBenefit: "moderate",
    failureRate: 0.22,
    notes: "Fragile vein walls. Risk of rupture under pressure. Thin skin may improve visual detection but veins roll easily.",
  },

  diabetic: {
    ageRange: [30, 85],
    bmiRange: [22, 40],
    depthRange: { min: 2.0, max: 6.0, mean: 3.8, sd: 1.0 },
    diameterRange: { min: 1.2, max: 4.0, mean: 2.5, sd: 0.7 },
    visibilityDistribution: { high: 0.15, medium: 0.40, low: 0.45 },
    conditionDistribution: { normal: 0.25, fragile: 0.30, fibrotic: 0.25, frequently_cannulated: 0.20 },
    primarySites: ["cubital_fossa", "forearm"],
    difficultySites: ["dorsal_hand", "forearm"],
    motionArtifact: "low",
    skinToneEffect: "moderate",
    tourniquetBenefit: "moderate",
    failureRate: 0.25,
    notes: "Vascular changes due to diabetes. Increased fibrosis. Peripheral neuropathy may affect patient feedback.",
  },

  oncology: {
    ageRange: [20, 80],
    bmiRange: [16, 35],
    depthRange: { min: 1.5, max: 5.5, mean: 3.2, sd: 1.1 },
    diameterRange: { min: 0.8, max: 3.5, mean: 1.9, sd: 0.7 },
    visibilityDistribution: { high: 0.10, medium: 0.30, low: 0.60 },
    conditionDistribution: { normal: 0.10, fragile: 0.30, fibrotic: 0.35, collapsed: 0.15, frequently_cannulated: 0.10 },
    primarySites: ["cubital_fossa", "forearm"],
    difficultySites: ["dorsal_hand", "forearm", "cubital_fossa"],
    motionArtifact: "low",
    skinToneEffect: "moderate",
    tourniquetBenefit: "low",
    failureRate: 0.40,
    notes: "Chemotherapy-damaged veins. High fibrosis. Veins may be scarred from repeated cannulation. Consider PICC/port.",
  },

  obese: {
    ageRange: [20, 70],
    bmiRange: [30, 39.9],
    depthRange: { min: 3.0, max: 8.0, mean: 5.5, sd: 1.2 },
    diameterRange: { min: 2.0, max: 5.0, mean: 3.0, sd: 0.8 },
    visibilityDistribution: { high: 0.10, medium: 0.30, low: 0.60 },
    conditionDistribution: { normal: 0.60, fragile: 0.10, fibrotic: 0.10, frequently_cannulated: 0.20 },
    primarySites: ["cubital_fossa", "forearm"],
    difficultySites: ["dorsal_hand", "deep_forearm"],
    motionArtifact: "low",
    skinToneEffect: "high",
    tourniquetBenefit: "moderate",
    failureRate: 0.30,
    notes: "Increased subcutaneous fat layer. Veins are deeper. NIR penetration may be insufficient for deep veins.",
  },

  morbidly_obese: {
    ageRange: [20, 65],
    bmiRange: [40, 55],
    depthRange: { min: 5.0, max: 12.0, mean: 7.5, sd: 1.8 },
    diameterRange: { min: 2.0, max: 5.5, mean: 3.2, sd: 0.9 },
    visibilityDistribution: { high: 0.05, medium: 0.15, low: 0.80 },
    conditionDistribution: { normal: 0.50, fragile: 0.10, fibrotic: 0.15, frequently_cannulated: 0.25 },
    primarySites: ["cubital_fossa"],
    difficultySites: ["dorsal_hand", "forearm", "deep_forearm"],
    motionArtifact: "low",
    skinToneEffect: "very_high",
    tourniquetBenefit: "low",
    failureRate: 0.45,
    notes: "Extreme depth. Thick fat layer severely limits NIR imaging. Ultrasound guidance strongly recommended.",
  },

  dehydrated: {
    ageRange: [18, 85],
    bmiRange: [16, 35],
    depthRange: { min: 2.0, max: 6.0, mean: 3.5, sd: 1.0 },
    diameterRange: { min: 0.8, max: 3.0, mean: 1.8, sd: 0.6 },
    visibilityDistribution: { high: 0.10, medium: 0.25, low: 0.65 },
    conditionDistribution: { normal: 0.40, fragile: 0.25, collapsed: 0.30, frequently_cannulated: 0.05 },
    primarySites: ["cubital_fossa", "forearm"],
    difficultySites: ["dorsal_hand"],
    motionArtifact: "low",
    skinToneEffect: "moderate",
    tourniquetBenefit: "low",
    failureRate: 0.35,
    notes: "Reduced blood volume causes vein collapse. Veins appear smaller than baseline. Hydration before attempt recommended.",
  },
}

// ─── ANATOMICAL SITE PARAMETERS ────────────────────────────

const ANATOMICAL_SITES = {
  cubital_fossa: {
    name: "Cubital Fossa",
    veins: ["Median Cubital", "Cephalic", "Basilic"],
    depthModifier: 0,     // baseline
    diameterModifier: 0.5, // generally larger veins here
    cannulationSuitability: "high",
    motionRisk: "low",
    description: "Antecubital region. Most common venipuncture site.",
  },
  forearm: {
    name: "Forearm",
    veins: ["Cephalic", "Basilic", "Accessory Cephalic", "Median Antebrachial"],
    depthModifier: 0.3,
    diameterModifier: 0,
    cannulationSuitability: "moderate",
    motionRisk: "low",
    description: "Volar forearm. Good for IV cannulation.",
  },
  dorsal_hand: {
    name: "Dorsal Hand",
    veins: ["Dorsal Metacarpal", "Cephalic (distal)", "Dorsal Venous Arch"],
    depthModifier: -0.8,  // shallower
    diameterModifier: -0.5, // generally smaller
    cannulationSuitability: "moderate",
    motionRisk: "moderate",
    description: "Back of the hand. Visible but often small caliber.",
  },
  scalp: {
    name: "Scalp",
    veins: ["Superficial Temporal", "Frontal", "Occipital"],
    depthModifier: -1.0,
    diameterModifier: -0.8,
    cannulationSuitability: "neonatal_only",
    motionRisk: "high",
    description: "Used primarily in neonates when other access fails.",
  },
  foot_dorsal: {
    name: "Dorsal Foot",
    veins: ["Dorsal Venous Arch", "Great Saphenous (distal)"],
    depthModifier: -0.5,
    diameterModifier: -0.3,
    cannulationSuitability: "last_resort",
    motionRisk: "moderate",
    description: "Used in neonates or when upper extremity access unavailable.",
  },
  deep_forearm: {
    name: "Deep Forearm",
    veins: ["Deep Basilic", "Deep Cephalic"],
    depthModifier: 2.0,
    diameterModifier: 0.3,
    cannulationSuitability: "ultrasound_guided",
    motionRisk: "low",
    description: "Deep veins requiring ultrasound guidance for access.",
  },
}

// ─── FITZPATRICK SKIN TONE SCALE ───────────────────────────

const FITZPATRICK_SCALE = {
  I: { label: "Very Fair", nirEffect: "minimal", contrastRatio: 0.95 },
  II: { label: "Fair", nirEffect: "minimal", contrastRatio: 0.90 },
  III: { label: "Medium", nirEffect: "low", contrastRatio: 0.80 },
  IV: { label: "Olive", nirEffect: "moderate", contrastRatio: 0.65 },
  V: { label: "Brown", nirEffect: "significant", contrastRatio: 0.50 },
  VI: { label: "Dark", nirEffect: "high", contrastRatio: 0.35 },
}

// ─── VEIN CONDITION DETAILS ────────────────────────────────

const VEIN_CONDITIONS = {
  normal: {
    label: "Normal",
    compressibility: "normal",
    diameterReduction: 0,
    visibilityReduction: 0,
    detectionFailureIncrease: 0,
    clinicalNotes: "Healthy vein. Good elasticity and filling.",
  },
  fragile: {
    label: "Fragile",
    compressibility: "increased",
    diameterReduction: -0.3,
    visibilityReduction: -0.1,
    detectionFailureIncrease: 0.15,
    clinicalNotes: "Thin vein walls. Risk of rupture on cannulation. Common in elderly and steroid users.",
  },
  fibrotic: {
    label: "Fibrotic",
    compressibility: "reduced",
    diameterReduction: -0.5,
    visibilityReduction: -0.2,
    detectionFailureIncrease: 0.25,
    clinicalNotes: "Hardened vein walls from repeated cannulation or chemotherapy. Reduced lumen diameter.",
  },
  collapsed: {
    label: "Collapsed",
    compressibility: "flat",
    diameterReduction: -0.8,
    visibilityReduction: -0.4,
    detectionFailureIncrease: 0.40,
    clinicalNotes: "Vein lumen collapsed due to dehydration, hypovolemia, or repeated access. May not be detectable.",
  },
  frequently_cannulated: {
    label: "Frequently Cannulated",
    compressibility: "variable",
    diameterReduction: -0.2,
    visibilityReduction: -0.15,
    detectionFailureIncrease: 0.10,
    clinicalNotes: "Multiple previous access points. Scar tissue may affect detection. Check for phlebitis signs.",
  },
}

// ─── NAME GENERATION ───────────────────────────────────────

const FIRST_NAMES = [
  "Ahmed", "Fatima", "Omar", "Layla", "Hassan", "Mariam", "Youssef", "Sara",
  "Khaled", "Nour", "Ali", "Dina", "Ibrahim", "Hana", "Mohamed", "Salma",
  "Amr", "Rania", "Tarek", "Yasmin", "Amir", "Lina", "Karim", "Mona",
  "Mostafa", "Aya", "Mahmoud", "Jana", "Adel", "Farida", "Ziad", "Rawda",
  "Nabil", "Eman", "Hossam", "Sahar", "Waleed", "Nada", "Sami", "Dalia",
  "Rami", "Lobna", "Sherif", "Abeer", "Tamer", "Noha", "Wael", "Amani",
  "Bassem", "Heba", "Ashraf", "Ghada", "Fadi", "Nesreen", "Hazem", "Mai",
  "Reda", "Samira", "Ehab", "Sawsan",
]

const LAST_INITIALS = [
  "A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J.",
  "K.", "L.", "M.", "N.", "O.", "P.", "Q.", "R.", "S.", "T.",
  "U.", "V.", "W.", "X.", "Y.", "Z.",
]

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

// ─── UTILITY FUNCTIONS ─────────────────────────────────────

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1))
}

function gaussianRandom(mean, sd) {
  // Box-Muller transform for normal distribution
  let u1 = Math.random()
  let u2 = Math.random()
  let z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * sd
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

function weightedRandom(distribution) {
  const rand = Math.random()
  let cumulative = 0
  for (const [key, probability] of Object.entries(distribution)) {
    cumulative += probability
    if (rand <= cumulative) return key
  }
  return Object.keys(distribution)[0]
}

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateId(prefix, index) {
  return `${prefix}-${String(index).padStart(3, "0")}`
}

function generateDate(daysAgo) {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().split("T")[0]
}

function randomFitzpatrick() {
  const types = ["I", "II", "III", "IV", "V", "VI"]
  // Weighted towards middle types
  const weights = [0.08, 0.15, 0.25, 0.25, 0.17, 0.10]
  return types[weightedRandom(Object.fromEntries(types.map((t, i) => [i, weights[i]])))]
}

// ─── CORE DATA GENERATORS ──────────────────────────────────

function generateVeinMeasurement(populationProfile, site, veinName, condition) {
  const siteData = ANATOMICAL_SITES[site]
  const conditionData = VEIN_CONDITIONS[condition]
  const profile = populationProfile

  // Generate depth with gaussian distribution + site modifier
  let depth = gaussianRandom(profile.depthRange.mean, profile.depthRange.sd)
  depth += siteData.depthModifier
  depth = clamp(depth, profile.depthRange.min, profile.depthRange.max)
  depth = roundTo(depth, 1)

  // Generate diameter with gaussian distribution + modifiers
  let diameter = gaussianRandom(profile.diameterRange.mean, profile.diameterRange.sd)
  diameter += siteData.diameterModifier
  diameter += conditionData.diameterReduction
  diameter = clamp(diameter, profile.diameterRange.min, profile.diameterRange.max)
  diameter = roundTo(diameter, 1)

  // Generate depth with tourniquet (typically reduces depth by 10-25%)
  const tourniquetReduction = randomBetween(0.10, 0.25)
  const depthWithTourniquet = roundTo(depth * (1 - tourniquetReduction), 1)

  // Generate diameter with tourniquet (typically increases by 15-40%)
  const tourniquetIncrease = randomBetween(0.15, 0.40)
  const diameterWithTourniquet = roundTo(diameter * (1 + tourniquetIncrease), 1)

  // Calculate visibility
  const visibility = calculateVisibility(profile, condition, depth, diameter)

  // Calculate stability index (0-100)
  const stability = calculateStability(condition, profile, diameter)

  // Determine if detection would succeed
  const detectionSuccess = Math.random() > (profile.failureRate + conditionData.detectionFailureIncrease)

  return {
    veinName,
    anatomicalSite: siteData.name,
    siteKey: site,
    condition,
    conditionDetails: conditionData.label,
    measurements: {
      depth: {
        value: depth,
        withTourniquet: depthWithTourniquet,
        unit: "mm",
        method: "Ultrasound B-mode",
      },
      diameter: {
        value: diameter,
        withTourniquet: diameterWithTourniquet,
        unit: "mm",
        method: "Ultrasound B-mode",
      },
      stability: stability,
    },
    visibility: {
      score: visibility.score,
      level: visibility.level,
      contrastRatio: visibility.contrastRatio,
      snr: visibility.snr,
      segmentationSuccess: detectionSuccess,
    },
    detectability: classifyDetectability(depth, diameter, visibility.score),
    clinicalNotes: conditionData.clinicalNotes,
  }
}

function calculateVisibility(profile, condition, depth, diameter) {
  const conditionData = VEIN_CONDITIONS[condition]

  // Base visibility from population distribution
  const visLevel = weightedRandom(profile.visibilityDistribution)

  let score
  if (visLevel === "high") score = randomBetween(75, 100)
  else if (visLevel === "medium") score = randomBetween(40, 74)
  else score = randomBetween(10, 39)

  // Modify by condition
  score = score * (1 - conditionData.visibilityReduction)

  // Modify by depth (deeper = less visible)
  if (depth > 5) score *= 0.7
  else if (depth > 3) score *= 0.85

  // Modify by diameter (smaller = less visible)
  if (diameter < 1.5) score *= 0.75
  else if (diameter < 2.0) score *= 0.85

  score = clamp(Math.round(score), 5, 100)

  // Calculate contrast ratio and SNR
  const contrastRatio = roundTo(score / 100 * 0.8 + randomBetween(0, 0.15), 2)
  const snr = roundTo(score / 10 + randomBetween(-1, 2), 1)

  let level
  if (score >= 70) level = "High"
  else if (score >= 40) level = "Medium"
  else level = "Low"

  return { score, level, contrastRatio, snr }
}

function calculateStability(condition, profile, diameter) {
  let stability = 75 // base

  // Condition adjustments
  if (condition === "normal") stability += randomBetween(5, 15)
  if (condition === "fragile") stability -= randomBetween(15, 30)
  if (condition === "fibrotic") stability -= randomBetween(5, 15)
  if (condition === "collapsed") stability -= randomBetween(25, 40)
  if (condition === "frequently_cannulated") stability -= randomBetween(5, 20)

  // Motion artifact adjustment
  if (profile.motionArtifact === "high") stability -= randomBetween(10, 20)

  // Diameter adjustment (larger veins are more stable)
  if (diameter >= 3.0) stability += 5
  if (diameter < 1.5) stability -= 10

  return clamp(Math.round(stability), 10, 98)
}

function classifyDetectability(depth, diameter, visibilityScore) {
  let score = 0

  // Depth scoring
  if (depth <= 2.0) score += 3
  else if (depth <= 4.0) score += 2
  else if (depth <= 6.0) score += 1
  else score += 0

  // Diameter scoring
  if (diameter >= 3.0) score += 3
  else if (diameter >= 2.0) score += 2
  else if (diameter >= 1.0) score += 1
  else score += 0

  // Visibility scoring
  if (visibilityScore >= 70) score += 3
  else if (visibilityScore >= 40) score += 2
  else if (visibilityScore >= 20) score += 1
  else score += 0

  // Classify
  if (score >= 8) return { category: "clearly_detectable", label: "Clearly Detectable", color: "#22c55e" }
  if (score >= 5) return { category: "moderately_detectable", label: "Moderately Detectable", color: "#eab308" }
  if (score >= 3) return { category: "weakly_detectable", label: "Weakly Detectable", color: "#f97316" }
  return { category: "undetectable", label: "Undetectable", color: "#ef4444" }
}

// ─── PATIENT GENERATOR ─────────────────────────────────────

function generatePatient(index, populationType) {
  const profile = POPULATION_PROFILES[populationType]
  const id = generateId("PT", index)

  // Generate demographics
  let age
  if (populationType === "neonatal") {
    age = 0 // Display as days separately
  } else {
    age = randomInt(profile.ageRange[0], profile.ageRange[1])
  }

  const ageGroup = populationType === "neonatal" ? "neonatal"
    : age < 18 ? "pediatric"
    : age >= 65 ? "geriatric"
    : "adult"

  const sex = Math.random() > 0.5 ? "male" : "female"
  const bmi = roundTo(randomBetween(profile.bmiRange[0], profile.bmiRange[1]), 1)
  const fitzpatrick = randomFitzpatrick()
  const name = randomElement(FIRST_NAMES) + " " + randomElement(LAST_INITIALS)
  const bloodType = randomElement(BLOOD_TYPES)

  // Map population type to patient history
  let history = "none"
  if (populationType === "diabetic") history = "diabetes"
  else if (populationType === "oncology") history = "chemotherapy"
  else if (populationType === "obese" || populationType === "morbidly_obese") history = "obesity"
  else if (populationType === "dehydrated") history = "dehydration"

  // Hydration status
  let hydrationStatus = "normal"
  if (populationType === "dehydrated") hydrationStatus = "dehydrated"
  else if (Math.random() < 0.1) hydrationStatus = "mildly_dehydrated"

  // Generate neonatal-specific data
  const neonatalData = populationType === "neonatal" ? {
    ageInDays: randomInt(1, 28),
    gestationalAge: randomInt(34, 42),
    birthWeight: roundTo(randomBetween(2.0, 4.5), 2),
  } : null

  return {
    id,
    name,
    age,
    ageGroup,
    sex,
    bmi,
    bloodType,
    fitzpatrickType: fitzpatrick,
    fitzpatrickDetails: FITZPATRICK_SCALE[fitzpatrick],
    populationType,
    history,
    hydrationStatus,
    neonatalData,
    clinicalGroup: populationType,
    motionArtifactRisk: profile.motionArtifact,
    notes: profile.notes,
    createdAt: generateDate(randomInt(1, 365)),
  }
}

// ─── SCAN GENERATOR ────────────────────────────────────────

function generateScan(patient, scanIndex, daysAgo) {
  const profile = POPULATION_PROFILES[patient.populationType]
  const scanId = `scan-${scanIndex + 1}`
  const date = generateDate(daysAgo)
  const arm = Math.random() > 0.5 ? "left" : "right"

  // Select anatomical sites to scan (1-3 sites)
  const numSites = randomInt(1, Math.min(3, profile.primarySites.length))
  const selectedSites = []
  const availableSites = [...profile.primarySites]
  for (let i = 0; i < numSites; i++) {
    const idx = randomInt(0, availableSites.length - 1)
    selectedSites.push(availableSites.splice(idx, 1)[0])
  }

  // Generate vein measurements for each site
  const veins = []
  for (const site of selectedSites) {
    const siteData = ANATOMICAL_SITES[site]
    // Pick 1-2 veins from this site
    const numVeins = randomInt(1, Math.min(2, siteData.veins.length))
    const availableVeins = [...siteData.veins]

    for (let v = 0; v < numVeins; v++) {
      const veinIdx = randomInt(0, availableVeins.length - 1)
      const veinName = availableVeins.splice(veinIdx, 1)[0]
      const condition = weightedRandom(profile.conditionDistribution)

      const measurement = generateVeinMeasurement(profile, site, veinName, condition)
      veins.push(measurement)
    }
  }

  // Sort veins by visibility (best first)
  veins.sort((a, b) => b.visibility.score - a.visibility.score)

  // Generate recommendation based on best vein
  const bestVein = veins[0]
  const recommendation = generateRecommendationFromVein(bestVein, patient)

  // Environmental conditions
  const roomTemp = roundTo(randomBetween(20, 25), 1)
  const skinTemp = roundTo(randomBetween(30, 35), 1)

  return {
    id: scanId,
    date,
    arm,
    veins: veins.map(v => ({
      name: v.veinName,
      site: v.anatomicalSite,
      depth: v.measurements.depth.value,
      depthWithTourniquet: v.measurements.depth.withTourniquet,
      diameter: v.measurements.diameter.value,
      diameterWithTourniquet: v.measurements.diameter.withTourniquet,
      stability: v.measurements.stability,
      condition: v.conditionDetails,
      visibility: v.visibility.level,
      visibilityScore: v.visibility.score,
      contrastRatio: v.visibility.contrastRatio,
      snr: v.visibility.snr,
      detectability: v.detectability.label,
      segmentationSuccess: v.visibility.segmentationSuccess,
    })),
    recommendation,
    environmentalConditions: {
      roomTemperature: roomTemp,
      skinTemperature: skinTemp,
      tourniquetApplied: true,
      tourniquetDuration: randomInt(30, 120) + "s",
    },
    scanMetadata: {
      imagingMethod: "NIR + Ultrasound verification",
      scanDuration: randomInt(15, 45) + "s",
      operatorExperience: randomElement(["junior", "mid-level", "senior"]),
    },
  }
}

function generateRecommendationFromVein(vein, patient) {
  const diameter = vein.measurements.diameter.value
  const depth = vein.measurements.depth.value
  const stability = vein.measurements.stability

  // Gauge selection logic
  let gauge
  if (patient.populationType === "neonatal") {
    gauge = diameter >= 1.0 ? "24G" : "24G"
  } else {
    if (diameter >= 5.0) gauge = "16G"
    else if (diameter >= 3.5) gauge = "18G"
    else if (diameter >= 2.5) gauge = "20G"
    else if (diameter >= 1.5) gauge = "22G"
    else gauge = "24G"
  }

  // Adjust for population
  const gaugeOrder = ["16G", "18G", "20G", "22G", "24G"]
  let idx = gaugeOrder.indexOf(gauge)
  if (["geriatric", "pediatric", "neonatal"].includes(patient.ageGroup) && idx < 4) idx++
  if (["chemotherapy", "dehydration"].includes(patient.history) && idx < 4) idx++
  gauge = gaugeOrder[idx]

  // Success probability
  let success = 85
  const needleODs = { "16G": 1.65, "18G": 1.27, "20G": 0.91, "22G": 0.72, "24G": 0.56 }
  const ratio = diameter / needleODs[gauge]
  if (ratio >= 3) success += 8
  else if (ratio >= 2) success += 4
  else if (ratio < 1.5) success -= 10

  if (depth <= 2) success += 5
  else if (depth > 6) success -= 12
  else if (depth > 4) success -= 5

  success += (stability - 50) * 0.15

  if (patient.ageGroup === "pediatric" || patient.ageGroup === "neonatal") success -= 8
  if (patient.ageGroup === "geriatric") success -= 6
  if (patient.history === "chemotherapy") success -= 12
  if (patient.history === "diabetes") success -= 5
  if (patient.history === "dehydration") success -= 10
  if (patient.history === "obesity") success -= 7

  success = clamp(Math.round(success), 25, 99)

  return {
    gauge,
    success,
    length: depth <= 2 ? "0.75 inch" : depth <= 4 ? "1.00 inch" : depth <= 6 ? "1.25 inch" : "1.50 inch",
    confidenceLevel: success >= 85 ? "HIGH" : success >= 65 ? "MODERATE" : "LOW",
    targetVein: vein.veinName,
    targetSite: vein.anatomicalSite,
  }
}

// ─── MAIN GENERATION FUNCTION ──────────────────────────────

export function generateFullDataset(config = {}) {
  const {
    patientsPerGroup = 5,
    maxScansPerPatient = 3,
    includeSpecialCases = true,
  } = config

  const populationTypes = [
    "adult", "pediatric", "geriatric", "diabetic", "oncology", "obese",
  ]

  if (includeSpecialCases) {
    populationTypes.push("neonatal", "morbidly_obese", "dehydrated")
  }

  const patients = []
  let patientIndex = 1

  for (const popType of populationTypes) {
    for (let i = 0; i < patientsPerGroup; i++) {
      const patient = generatePatient(patientIndex, popType)

      // Generate 1-3 scans per patient
      const numScans = randomInt(1, maxScansPerPatient)
      const scans = []
      for (let s = 0; s < numScans; s++) {
        const daysAgo = s * randomInt(14, 60) + randomInt(1, 14)
        scans.push(generateScan(patient, s, daysAgo))
      }

      // Sort scans by date (most recent first)
      scans.sort((a, b) => new Date(b.date) - new Date(a.date))

      patients.push({
        ...patient,
        scans,
        lastScanDate: scans[0]?.date || null,
      })

      patientIndex++
    }
  }

  // Generate system threshold reference
  const thresholds = generateDetectionThresholds()

  return {
    patients,
    metadata: {
      generatedAt: new Date().toISOString(),
      totalPatients: patients.length,
      totalScans: patients.reduce((sum, p) => sum + p.scans.length, 0),
      populationGroups: populationTypes,
      patientsPerGroup,
      dataVersion: "1.0.0",
      referenceStandard: "Ultrasound B-mode + NIR imaging",
    },
    populationProfiles: POPULATION_PROFILES,
    anatomicalSites: ANATOMICAL_SITES,
    fitzpatrickScale: FITZPATRICK_SCALE,
    veinConditions: VEIN_CONDITIONS,
    detectionThresholds: thresholds,
  }
}

function generateDetectionThresholds() {
  return {
    clearly_detectable: {
      depth: { max: 3.0, unit: "mm" },
      diameter: { min: 2.5, unit: "mm" },
      visibilityScore: { min: 70 },
      snr: { min: 8.0 },
      description: "Vein is clearly defined, high contrast, stable segmentation possible",
    },
    moderately_detectable: {
      depth: { max: 5.0, unit: "mm" },
      diameter: { min: 1.5, unit: "mm" },
      visibilityScore: { min: 40 },
      snr: { min: 5.0 },
      description: "Vein is visible but requires enhanced processing or tourniquet",
    },
    weakly_detectable: {
      depth: { max: 8.0, unit: "mm" },
      diameter: { min: 0.8, unit: "mm" },
      visibilityScore: { min: 20 },
      snr: { min: 2.5 },
      description: "Vein is weak, inconsistent, or not reliably segmented without assistance",
    },
    undetectable: {
      depth: { max: null, unit: "mm" },
      diameter: { min: null, unit: "mm" },
      visibilityScore: { min: null },
      snr: { min: null },
      description: "Vein cannot be reliably detected. Ultrasound guidance required.",
    },
    systemLimits: {
      maxDetectableDepth: 8.0,
      minDetectableDiameter: 0.5,
      minContrastRatio: 0.15,
      minSNR: 2.0,
    },
  }
}

// ─── EXPORT FOR USE IN APP ─────────────────────────────────

export function generateAppData(patientCount = 5) {
  const fullDataset = generateFullDataset({
    patientsPerGroup: patientCount,
    maxScansPerPatient: 3,
    includeSpecialCases: true,
  })

  // Convert to simpler format used by the app
  const appPatients = fullDataset.patients.map(patient => ({
    id: patient.id,
    name: patient.name,
    age: patient.age,
    ageGroup: patient.populationType === "neonatal" ? "pediatric" :
              patient.age >= 65 ? "geriatric" :
              patient.age < 18 ? "pediatric" : "adult",
    sex: patient.sex,
    bmi: patient.bmi,
    bloodType: patient.bloodType,
    history: patient.history,
    populationType: patient.populationType,
    fitzpatrick: patient.fitzpatrickType,
    hydrationStatus: patient.hydrationStatus,
    notes: patient.notes,
    lastScanDate: patient.lastScanDate,
  }))

  const appScans = {}
  fullDataset.patients.forEach(patient => {
    appScans[patient.id] = patient.scans
  })

  return {
    patients: appPatients,
    scans: appScans,
    thresholds: fullDataset.detectionThresholds,
    metadata: fullDataset.metadata,
  }
}

// Default export for quick use
export default generateFullDataset