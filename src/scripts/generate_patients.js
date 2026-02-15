import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ═══ UTILITIES ═════════════════════════════════════════════

function rand(min, max) { return min + Math.random() * (max - min); }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
function round1(v) { return Math.round(v * 10) / 10; }
function round2(v) { return Math.round(v * 100) / 100; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function gaussian(mean, sd) {
    const u1 = Math.random(), u2 = Math.random();
    return mean + sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function weightedPick(dist) {
    const r = Math.random();
    let cum = 0;
    for (const [key, prob] of Object.entries(dist)) {
        cum += prob;
        if (r <= cum) return key;
    }
    return Object.keys(dist)[0];
}

function dateOnly(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
}

// ═══ EGYPTIAN NATIONAL ID (14 digits) ══════════════════════
const GOV_CODES = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27',
];

function generateNationalId(birthYear, birthMonth, birthDay) {
    const c = birthYear >= 2000 ? '3' : '2';
    const yy = String(birthYear % 100).padStart(2, '0');
    const mm = String(birthMonth).padStart(2, '0');
    const dd = String(birthDay).padStart(2, '0');
    const gg = pick(GOV_CODES);
    const ssss = String(randInt(1, 9999)).padStart(4, '0');
    const partial = `${c}${yy}${mm}${dd}${gg}${ssss}`;
    const k = partial.split('').reduce((a, c) => a + parseInt(c), 0) % 10;
    return `${partial}${k}`;
}

// ═══ NAMES ═════════════════════════════════════════════════
const MALE_NAMES = [
    'أحمد محمد إبراهيم', 'محمد علي حسن', 'عمر خالد سعيد', 'يوسف طارق عبدالله',
    'خالد مصطفى أحمد', 'إبراهيم حسام عمر', 'علي رضا محمود', 'حسن وليد فاروق',
    'مصطفى عادل رشدي', 'كريم شريف نبيل', 'عمرو باسم هشام', 'طارق سامي وائل',
    'محمود أشرف ماجد', 'زياد فادي رامي', 'نبيل إيهاب تامر', 'وائل حازم سمير',
    'عبدالرحمن أمير يحيى', 'سامح أيمن جمال', 'ياسر هاني رفعت', 'رامي شادي منير',
    'بلال همام عصام', 'أنس مراد سليم', 'آدم حمزة مالك', 'يحيى سيف رضوان',
    'حسين كمال عزت', 'فارس جاد وسيم', 'عمار سراج بهاء', 'باسل نادر صبحي',
    'سليمان توفيق راشد', 'حاتم مجدي لطفي',
];

const FEMALE_NAMES = [
    'فاطمة أحمد محمد', 'سارة خالد إبراهيم', 'نور محمد علي', 'ليلى حسن عمر',
    'مريم يوسف طارق', 'هنا إبراهيم حسام', 'دينا علي مصطفى', 'منى كريم شريف',
    'رنا عمرو باسم', 'سلمى طارق سامي', 'آية محمود أشرف', 'جنا زياد فادي',
    'ياسمين نبيل إيهاب', 'هبة وائل حازم', 'أمل سامح أيمن', 'نادية ياسر هاني',
    'لبنى رامي شادي', 'صابرين محمد عوض', 'إيمان عبدالله توفيق', 'سحر فؤاد رفعت',
    'ندى حسين كمال', 'رودينا شهاب أسامة', 'ملك عمار مهدي', 'تقى بدر رؤوف',
    'جميلة راغب حلمي', 'داليا منصور فهمي', 'نهى عاطف سعد', 'شيماء بركات عيسى',
    'عبير غالي مختار', 'حنين وجيه صفوت',
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function pickFitzpatrick() {
    const weights = { 'I': 0.02, 'II': 0.08, 'III': 0.25, 'IV': 0.35, 'V': 0.22, 'VI': 0.08 };
    return weightedPick(weights);
}

// ═══ POPULATION PROFILES ════════════════════════════════════
const PROFILES = {
    adult: {
        ageRange: [18, 64],
        bmiRange: [18.5, 29.9],
        depth: { mean: 3.0, sd: 0.8, min: 1.5, max: 5.0 },
        diameter: { mean: 3.2, sd: 0.7, min: 1.5, max: 5.5 },
        visDist: { High: 0.50, Medium: 0.35, Low: 0.15 },
        condDist: { Normal: 0.80, Fragile: 0.05, 'Frequently Cannulated': 0.15 },
        conditions: [],
        failRate: 0.08,
    },
    pediatric: {
        ageRange: [1, 17],
        bmiRange: [14, 28],
        depth: { mean: 2.0, sd: 0.6, min: 1.0, max: 4.0 },
        diameter: { mean: 1.8, sd: 0.5, min: 0.8, max: 3.0 },
        visDist: { High: 0.25, Medium: 0.45, Low: 0.30 },
        condDist: { Normal: 0.90, Fragile: 0.05, 'Frequently Cannulated': 0.05 },
        conditions: [],
        failRate: 0.20,
    },
    geriatric: {
        ageRange: [65, 92],
        bmiRange: [17, 32],
        depth: { mean: 2.5, sd: 1.0, min: 1.0, max: 4.5 },
        diameter: { mean: 2.2, sd: 0.8, min: 1.0, max: 4.0 },
        visDist: { High: 0.20, Medium: 0.40, Low: 0.40 },
        condDist: { Normal: 0.30, Fragile: 0.40, Fibrotic: 0.15, 'Frequently Cannulated': 0.15 },
        conditions: [],
        failRate: 0.22,
    },
    diabetic: {
        ageRange: [30, 80],
        bmiRange: [22, 40],
        depth: { mean: 3.8, sd: 1.0, min: 2.0, max: 6.0 },
        diameter: { mean: 2.5, sd: 0.7, min: 1.2, max: 4.0 },
        visDist: { High: 0.15, Medium: 0.40, Low: 0.45 },
        condDist: { Normal: 0.25, Fragile: 0.30, Fibrotic: 0.25, 'Frequently Cannulated': 0.20 },
        conditions: ['diabetes'],
        failRate: 0.25,
    },
    oncology: {
        ageRange: [20, 78],
        bmiRange: [16, 35],
        depth: { mean: 3.2, sd: 1.1, min: 1.5, max: 5.5 },
        diameter: { mean: 1.9, sd: 0.7, min: 0.8, max: 3.5 },
        visDist: { High: 0.10, Medium: 0.30, Low: 0.60 },
        condDist: { Normal: 0.10, Fragile: 0.30, Fibrotic: 0.35, Collapsed: 0.15, 'Frequently Cannulated': 0.10 },
        conditions: ['chemotherapy'],
        failRate: 0.40,
    },
    obese: {
        ageRange: [20, 68],
        bmiRange: [30, 39.9],
        depth: { mean: 5.5, sd: 1.2, min: 3.0, max: 8.0 },
        diameter: { mean: 3.0, sd: 0.8, min: 2.0, max: 5.0 },
        visDist: { High: 0.10, Medium: 0.30, Low: 0.60 },
        condDist: { Normal: 0.60, Fragile: 0.10, Fibrotic: 0.10, 'Frequently Cannulated': 0.20 },
        conditions: ['obesity'],
        failRate: 0.30,
    },
    morbidly_obese: {
        ageRange: [22, 60],
        bmiRange: [40, 55],
        depth: { mean: 7.5, sd: 1.8, min: 5.0, max: 12.0 },
        diameter: { mean: 3.2, sd: 0.9, min: 2.0, max: 5.5 },
        visDist: { High: 0.05, Medium: 0.15, Low: 0.80 },
        condDist: { Normal: 0.50, Fragile: 0.10, Fibrotic: 0.15, 'Frequently Cannulated': 0.25 },
        conditions: ['obesity'],
        failRate: 0.45,
    },
    dehydrated: {
        ageRange: [18, 82],
        bmiRange: [16, 35],
        depth: { mean: 3.5, sd: 1.0, min: 2.0, max: 6.0 },
        diameter: { mean: 1.8, sd: 0.6, min: 0.8, max: 3.0 },
        visDist: { High: 0.10, Medium: 0.25, Low: 0.65 },
        condDist: { Normal: 0.40, Fragile: 0.25, Collapsed: 0.30, 'Frequently Cannulated': 0.05 },
        conditions: ['dehydration'],
        failRate: 0.35,
    },
    neonatal: {
        ageRange: [0, 0],
        bmiRange: [12, 16],
        depth: { mean: 1.2, sd: 0.4, min: 0.5, max: 2.5 },
        diameter: { mean: 0.8, sd: 0.3, min: 0.3, max: 1.5 },
        visDist: { High: 0.10, Medium: 0.30, Low: 0.60 },
        condDist: { Normal: 0.85, Fragile: 0.10, Collapsed: 0.05 },
        conditions: [],
        failRate: 0.35,
    },
};

// ═══ VEIN TEMPLATES ════════════════════════════════════════
const VEINS = {
    cephalic_forearm: {
        name: 'Cephalic Vein', bodyPart: 'forearm', category: 'primary', suitability: 'high',
        depthMod: 0, diameterMod: 0.5,
        position: { x: 0.62, y: 0.45 },
        svgPath: [
            { x: 0.68, y: 0.02 }, { x: 0.65, y: 0.12 }, { x: 0.62, y: 0.22 }, { x: 0.60, y: 0.33 },
            { x: 0.58, y: 0.45 }, { x: 0.55, y: 0.57 }, { x: 0.52, y: 0.68 }, { x: 0.50, y: 0.78 }, { x: 0.48, y: 0.90 },
        ],
        color: '#00e5ff',
    },
    basilic_forearm: {
        name: 'Basilic Vein', bodyPart: 'forearm', category: 'primary', suitability: 'moderate',
        depthMod: 0.8, diameterMod: -0.3,
        position: { x: 0.38, y: 0.45 },
        svgPath: [
            { x: 0.32, y: 0.02 }, { x: 0.34, y: 0.12 }, { x: 0.36, y: 0.22 }, { x: 0.37, y: 0.33 },
            { x: 0.38, y: 0.45 }, { x: 0.40, y: 0.57 }, { x: 0.42, y: 0.68 }, { x: 0.44, y: 0.78 }, { x: 0.46, y: 0.90 },
        ],
        color: '#00bcd4',
    },
    median_antebrachial: {
        name: 'Median Antebrachial Vein', bodyPart: 'forearm', category: 'secondary', suitability: 'moderate',
        depthMod: 0.3, diameterMod: -0.5,
        position: { x: 0.50, y: 0.55 },
        svgPath: [
            { x: 0.50, y: 0.35 }, { x: 0.49, y: 0.45 }, { x: 0.48, y: 0.55 }, { x: 0.48, y: 0.65 }, { x: 0.47, y: 0.75 }, { x: 0.47, y: 0.85 },
        ],
        color: '#0097a7',
    },
    accessory_cephalic: {
        name: 'Accessory Cephalic Vein', bodyPart: 'forearm', category: 'secondary', suitability: 'moderate',
        depthMod: 0.2, diameterMod: -0.4,
        position: { x: 0.65, y: 0.40 },
        svgPath: [
            { x: 0.60, y: 0.25 }, { x: 0.63, y: 0.32 }, { x: 0.65, y: 0.40 }, { x: 0.67, y: 0.50 }, { x: 0.68, y: 0.58 },
        ],
        color: '#4dd0e1',
    },
    median_cubital: {
        name: 'Median Cubital Vein', bodyPart: 'cubital_fossa', category: 'primary', suitability: 'excellent',
        depthMod: -0.5, diameterMod: 1.0,
        position: { x: 0.50, y: 0.32 },
        svgPath: [
            { x: 0.60, y: 0.26 }, { x: 0.56, y: 0.30 }, { x: 0.52, y: 0.33 }, { x: 0.48, y: 0.34 }, { x: 0.44, y: 0.33 }, { x: 0.40, y: 0.30 },
        ],
        color: '#26c6da',
    },
    dorsal_metacarpal: {
        name: 'Dorsal Metacarpal Vein', bodyPart: 'hand', category: 'secondary', suitability: 'moderate',
        depthMod: -1.0, diameterMod: -0.8,
        position: { x: 0.48, y: 0.85 },
        svgPath: [
            { x: 0.50, y: 0.78 }, { x: 0.49, y: 0.83 }, { x: 0.48, y: 0.88 }, { x: 0.47, y: 0.93 }, { x: 0.46, y: 0.97 },
        ],
        color: '#4dd0e1',
    },
    dorsal_venous_arch: {
        name: 'Dorsal Venous Arch', bodyPart: 'hand', category: 'secondary', suitability: 'moderate',
        depthMod: -0.8, diameterMod: -0.5,
        position: { x: 0.50, y: 0.80 },
        svgPath: [
            { x: 0.38, y: 0.78 }, { x: 0.43, y: 0.80 }, { x: 0.50, y: 0.81 }, { x: 0.57, y: 0.80 }, { x: 0.62, y: 0.78 },
        ],
        color: '#80deea',
    },
    superficial_temporal: {
        name: 'Superficial Temporal Vein', bodyPart: 'scalp', category: 'primary', suitability: 'neonatal_only',
        depthMod: -1.2, diameterMod: -1.0,
        position: { x: 0.30, y: 0.20 },
        svgPath: [
            { x: 0.25, y: 0.10 }, { x: 0.28, y: 0.15 }, { x: 0.30, y: 0.20 }, { x: 0.32, y: 0.28 }, { x: 0.33, y: 0.35 },
        ],
        color: '#b2ebf2',
    },
};

// Which veins per group
const GROUP_VEINS = {
    adult: ['cephalic_forearm', 'basilic_forearm', 'median_cubital', 'median_antebrachial', 'dorsal_metacarpal'],
    pediatric: ['cephalic_forearm', 'basilic_forearm', 'dorsal_metacarpal', 'dorsal_venous_arch'],
    geriatric: ['cephalic_forearm', 'basilic_forearm', 'median_cubital', 'dorsal_metacarpal'],
    diabetic: ['cephalic_forearm', 'basilic_forearm', 'median_cubital', 'median_antebrachial'],
    oncology: ['cephalic_forearm', 'basilic_forearm', 'median_cubital', 'accessory_cephalic'],
    obese: ['median_cubital', 'cephalic_forearm', 'basilic_forearm'],
    morbidly_obese: ['median_cubital', 'cephalic_forearm'],
    dehydrated: ['cephalic_forearm', 'basilic_forearm', 'median_cubital', 'dorsal_metacarpal'],
    neonatal: ['superficial_temporal', 'dorsal_metacarpal', 'dorsal_venous_arch'],
};

// ═══ MEASUREMENT GENERATOR ═════════════════════════════════
function generateMeasurement(profile, veinTemplate, condition) {
    // Depth
    let depth = gaussian(profile.depth.mean, profile.depth.sd) + veinTemplate.depthMod;
    depth = round1(clamp(depth, profile.depth.min, profile.depth.max));

    // Diameter with condition adjustments
    let diameter = gaussian(profile.diameter.mean, profile.diameter.sd) + veinTemplate.diameterMod;
    if (condition === 'Fragile') diameter -= 0.3;
    if (condition === 'Fibrotic') diameter -= 0.5;
    if (condition === 'Collapsed') diameter -= 0.8;
    if (condition === 'Frequently Cannulated') diameter -= 0.2;
    diameter = round1(clamp(diameter, profile.diameter.min, profile.diameter.max));

    // Tourniquet effects
    const depthWithTourniquet = round1(depth * (1 - rand(0.10, 0.25)));
    const diameterWithTourniquet = round1(diameter * (1 + rand(0.15, 0.40)));

    // Stability
    let stability = 75;
    if (condition === 'Normal') stability += randInt(5, 15);
    if (condition === 'Fragile') stability -= randInt(15, 30);
    if (condition === 'Fibrotic') stability -= randInt(5, 15);
    if (condition === 'Collapsed') stability -= randInt(25, 40);
    if (condition === 'Frequently Cannulated') stability -= randInt(5, 20);
    if (diameter >= 3.0) stability += 5;
    if (diameter < 1.5) stability -= 10;
    stability = clamp(Math.round(stability), 10, 98);

    // Visibility
    const visLevel = weightedPick(profile.visDist);
    let visScore;
    if (visLevel === 'High') visScore = randInt(70, 100);
    else if (visLevel === 'Medium') visScore = randInt(40, 69);
    else visScore = randInt(10, 39);
    if (depth > 5) visScore = Math.round(visScore * 0.7);
    else if (depth > 3) visScore = Math.round(visScore * 0.85);
    if (diameter < 1.5) visScore = Math.round(visScore * 0.75);
    visScore = clamp(visScore, 5, 100);

    const contrastRatio = round2(visScore / 100 * 0.8 + rand(0, 0.15));
    const snr = round1(visScore / 10 + rand(-1, 2));
    const confidence = clamp(Math.round(visScore * 0.9 + rand(0, 10)), 20, 99);
    const segSuccess = Math.random() > profile.failRate;

    // Detectability
    let ds = 0;
    if (depth <= 2) ds += 3; else if (depth <= 4) ds += 2; else if (depth <= 6) ds += 1;
    if (diameter >= 3) ds += 3; else if (diameter >= 2) ds += 2; else if (diameter >= 1) ds += 1;
    if (visScore >= 70) ds += 3; else if (visScore >= 40) ds += 2; else if (visScore >= 20) ds += 1;

    let detectability;
    if (ds >= 8) detectability = 'Clearly Detectable';
    else if (ds >= 5) detectability = 'Moderately Detectable';
    else if (ds >= 3) detectability = 'Weakly Detectable';
    else detectability = 'Undetectable';

    return {
        depth,
        depthWithTourniquet,
        diameter,
        diameterWithTourniquet,
        stability,
        visibility: visLevel,
        visibilityScore: visScore,
        contrastRatio,
        snr,
        confidence,
        detectability,
        segmentationSuccess: segSuccess,
    };
}

// ═══ MAIN SEED ═════════════════════════════════════════════
function generate() {
    console.log('🚀 Generating Patient Data JSON...\n');

    const PER_GROUP = 5;
    const mockDB = {};

    for (const [groupKey, profile] of Object.entries(PROFILES)) {
        for (let i = 0; i < PER_GROUP; i++) {
            const sex = Math.random() > 0.5 ? 'male' : 'female';
            const name = pick(sex === 'male' ? MALE_NAMES : FEMALE_NAMES);
            const age = groupKey === 'neonatal' ? 0 : randInt(profile.ageRange[0], profile.ageRange[1]);
            const birthYear = groupKey === 'neonatal' ? 2026 : 2026 - age;
            const nationalId = generateNationalId(birthYear, randInt(1, 12), randInt(1, 28));

            const conditions = [...profile.conditions];
            if (groupKey === 'geriatric' && Math.random() < 0.3) conditions.push('hypertension');

            const veinKeys = GROUP_VEINS[groupKey];
            const veinData = {};

            // Generate Veins for this patient
            // We'll map them to the format expected by the frontend: cephalic, basilic, medianCubital etc.
            // The script uses 'cephalic_forearm', 'basilic_forearm', so we need to map keys if necessary
            // or just use the keys from the script and update the frontend to read them.
            // For simplicity, let's map to the keys used in veinData.js where possible, or add new content.

            // veinData.js uses: cephalic, basilic, medianCubital, accessoryCephalic, dorsalArch

            // Map from Script Keys to FrontEnd Keys
            const keyMap = {
                'cephalic_forearm': 'cephalic',
                'basilic_forearm': 'basilic',
                'median_cubital': 'medianCubital',
                'accessory_cephalic': 'accessoryCephalic',
                'dorsal_venous_arch': 'dorsalArch'
            };

            const generatedVeins = {};

            for (const vKey of veinKeys) {
                const tmpl = VEINS[vKey];
                if (!tmpl) continue;

                const condition = weightedPick(profile.condDist);
                const measurement = generateMeasurement(profile, tmpl, condition);

                const feKey = keyMap[vKey] || vKey; // Use mapped key or fallback to original

                // Construct the vein object compatible with the frontend structure
                generatedVeins[feKey] = {
                    id: feKey,
                    name: tmpl.name,
                    anatomicalRegion: tmpl.bodyPart,
                    clinicalNotes: `Condition: ${condition}. ${measurement.detectability}`,
                    color: tmpl.color,
                    glowColor: tmpl.color.replace(')', ', 0.4)').replace('rgb', 'rgba'), // Approximation
                    lineWidth: measurement.diameter,
                    hotspot: {
                        x: tmpl.position.x, // Simplified, using template position
                        y: tmpl.position.y,
                        punctureScore: measurement.stability, // Using stability as score
                        reason: `${measurement.detectability} - ${condition}`
                    },
                    segments: [{ // Mock segments based on simple path
                        x: tmpl.position.x,
                        y: tmpl.position.y,
                        depth: measurement.depth,
                        diameter: measurement.diameter,
                        stability: measurement.stability,
                        confidence: measurement.confidence
                    }],
                    summary: {
                        avgDepth: measurement.depth,
                        avgDiameter: measurement.diameter,
                        avgStability: measurement.stability,
                        deviceConfidence: measurement.confidence,
                        accessDifficulty: measurement.detectability === 'Clearly Detectable' ? 'Easy' : 'Difficult',
                        recommendedGauge: measurement.diameter > 3 ? '18G' : measurement.diameter > 2 ? '20G' : '22G'
                    }
                };
            }

            mockDB[nationalId] = {
                id: nationalId, // Using National ID as the main key/ID
                nationalId: nationalId,
                name: name,
                age: age,
                gender: sex === 'male' ? 'Male' : 'Female',
                bloodType: pick(BLOOD_TYPES),
                condition: `${groupKey} - ${conditions.join(', ') || 'Healthy'}`,
                medicalOrders: [], // Empty for now, or could randomize
                veinData: generatedVeins
            };
        }
    }

    const outputPath = path.join(__dirname, '../data/generated_patients.json');
    fs.writeFileSync(outputPath, JSON.stringify(mockDB, null, 2));
    console.log(`✅ Database written to ${outputPath}`);
}

generate();
