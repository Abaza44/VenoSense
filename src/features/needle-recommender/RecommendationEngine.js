/**
 * VeinoTronic AI Recommendation Engine
 * 
 * Multi-factor scoring model for needle gauge selection.
 * Evaluates vein geometry, patient demographics, and stability metrics.
 */

// ─── NEEDLE DATABASE ───────────────────────────────────────
export const NEEDLE_SPECS = {
    "16G": { gauge: 16, outerDiameterMm: 1.65, typicalUse: "Rapid fluid/blood transfusion", color: "Gray" },
    "18G": { gauge: 18, outerDiameterMm: 1.27, typicalUse: "Blood transfusion, CT contrast", color: "Green" },
    "20G": { gauge: 20, outerDiameterMm: 0.91, typicalUse: "General IV access, most medications", color: "Pink" },
    "22G": { gauge: 22, outerDiameterMm: 0.72, typicalUse: "Pediatric, fragile veins, routine meds", color: "Blue" },
    "24G": { gauge: 24, outerDiameterMm: 0.56, typicalUse: "Neonatal, very small or fragile veins", color: "Yellow" },
};

// ─── MAIN RECOMMENDATION FUNCTION ──────────────────────────
export function generateRecommendation(input) {
    const {
        veinDepth,
        veinDiameter,
        ageGroup = "adult",
        stabilityIndex = 75,
        patientHistory = "none",
    } = input;

    // Validate inputs
    const errors = validateInputs(input);
    if (errors.length > 0) {
        return { error: true, messages: errors };
    }

    // Step 1: Base gauge selection from vein diameter
    let baseGauge = selectBaseGauge(veinDiameter);

    // Step 2: Adjust for age group
    baseGauge = adjustForAge(baseGauge, ageGroup);

    // Step 3: Adjust for patient history
    baseGauge = adjustForHistory(baseGauge, patientHistory);

    // Step 4: Determine needle length from depth
    const needleLength = selectNeedleLength(veinDepth);

    // Step 5: Calculate success probability
    const successProbability = calculateSuccessProbability({
        veinDiameter,
        veinDepth,
        stabilityIndex,
        ageGroup,
        patientHistory,
        gauge: baseGauge,
    });

    // Step 6: Generate risk warnings
    const risks = assessRisks({
        veinDiameter,
        veinDepth,
        stabilityIndex,
        ageGroup,
        patientHistory,
        gauge: baseGauge,
    });

    // Step 7: Build reasoning chain
    const reasoning = buildReasoning({
        veinDiameter,
        veinDepth,
        stabilityIndex,
        ageGroup,
        patientHistory,
        gauge: baseGauge,
        needleLength,
        successProbability,
    });

    return {
        error: false,
        recommendation: {
            gauge: baseGauge,
            gaugeDetails: NEEDLE_SPECS[baseGauge],
            needleLength,
            successProbability: Math.round(successProbability),
            confidenceLevel: getConfidenceLevel(successProbability),
            risks,
            reasoning,
            alternativeGauges: getAlternatives(baseGauge),
            timestamp: new Date().toISOString(),
        },
    };
}

// ─── HELPER FUNCTIONS ──────────────────────────────────────

function validateInputs({ veinDepth, veinDiameter, stabilityIndex }) {
    const errors = [];
    if (veinDepth == null || veinDepth < 0.5 || veinDepth > 15) {
        errors.push("Vein depth must be between 0.5mm and 15mm");
    }
    if (veinDiameter == null || veinDiameter < 0.3 || veinDiameter > 8) {
        errors.push("Vein diameter must be between 0.3mm and 8mm");
    }
    if (stabilityIndex != null && (stabilityIndex < 0 || stabilityIndex > 100)) {
        errors.push("Stability index must be between 0 and 100");
    }
    return errors;
}

function selectBaseGauge(diameter) {
    if (diameter >= 5.0) return "16G";
    if (diameter >= 3.5) return "18G";
    if (diameter >= 2.5) return "20G";
    if (diameter >= 1.5) return "22G";
    return "24G";
}

function adjustForAge(gauge, ageGroup) {
    const gaugeOrder = ["16G", "18G", "20G", "22G", "24G"];
    const idx = gaugeOrder.indexOf(gauge);

    if (ageGroup === "pediatric" && idx < gaugeOrder.length - 1) {
        return gaugeOrder[idx + 1]; // Go one size smaller
    }
    if (ageGroup === "geriatric" && idx < gaugeOrder.length - 1) {
        return gaugeOrder[idx + 1]; // Fragile veins — go smaller
    }
    return gauge;
}

function adjustForHistory(gauge, history) {
    const gaugeOrder = ["16G", "18G", "20G", "22G", "24G"];
    const idx = gaugeOrder.indexOf(gauge);

    if (
        (history === "chemotherapy" || history === "dehydration") &&
        idx < gaugeOrder.length - 1
    ) {
        return gaugeOrder[idx + 1]; // Compromised veins — go smaller
    }
    return gauge;
}

function selectNeedleLength(depth) {
    // Needle must be longer than vein depth with safety margin
    if (depth <= 2.0) return { mm: 19, inches: "0.75 inch", label: "Short" };
    if (depth <= 4.0) return { mm: 25, inches: "1.00 inch", label: "Standard" };
    if (depth <= 6.0) return { mm: 32, inches: "1.25 inch", label: "Long" };
    return { mm: 38, inches: "1.50 inch", label: "Extended" };
}

function calculateSuccessProbability({
    veinDiameter,
    veinDepth,
    stabilityIndex,
    ageGroup,
    patientHistory,
    gauge,
}) {
    let score = 85; // Base probability

    // Vein diameter factor (bigger vein = easier target)
    const needleOD = NEEDLE_SPECS[gauge].outerDiameterMm;
    const diameterRatio = veinDiameter / needleOD;
    if (diameterRatio >= 3.0) score += 8;
    else if (diameterRatio >= 2.0) score += 4;
    else if (diameterRatio >= 1.5) score += 0;
    else score -= 10;

    // Depth factor (deeper = harder)
    if (veinDepth <= 2.0) score += 5;
    else if (veinDepth <= 4.0) score += 0;
    else if (veinDepth <= 6.0) score -= 5;
    else score -= 12;

    // Stability factor
    score += (stabilityIndex - 50) * 0.15;

    // Age penalty
    if (ageGroup === "pediatric") score -= 8;
    if (ageGroup === "geriatric") score -= 6;

    // History penalty
    if (patientHistory === "chemotherapy") score -= 12;
    if (patientHistory === "diabetes") score -= 5;
    if (patientHistory === "dehydration") score -= 10;
    if (patientHistory === "obesity") score -= 7;

    return Math.max(35, Math.min(99, score));
}

function getConfidenceLevel(probability) {
    if (probability >= 85) return { level: "HIGH", color: "#22c55e" };
    if (probability >= 65) return { level: "MODERATE", color: "#eab308" };
    return { level: "LOW", color: "#ef4444" };
}

function assessRisks({ veinDiameter, veinDepth, stabilityIndex, ageGroup, patientHistory, gauge }) {
    const risks = [];

    const needleOD = NEEDLE_SPECS[gauge].outerDiameterMm;
    if (veinDiameter / needleOD < 1.8) {
        risks.push({
            severity: "warning",
            message: "Vein-to-needle ratio is tight. Consider stabilizing the vein before insertion.",
        });
    }

    if (veinDepth > 5) {
        risks.push({
            severity: "warning",
            message: "Deep vein access required. Use ultrasound guidance if available.",
        });
    }

    if (stabilityIndex < 40) {
        risks.push({
            severity: "critical",
            message: "Low vein stability. High risk of rolling. Anchor vein firmly before attempt.",
        });
    }

    if (patientHistory === "chemotherapy") {
        risks.push({
            severity: "warning",
            message: "Chemo-compromised veins. Consider warm compress to improve vein visibility.",
        });
    }

    if (patientHistory === "dehydration") {
        risks.push({
            severity: "info",
            message: "Dehydrated patient. Vein may appear smaller than normal. Consider hydration first.",
        });
    }

    if (ageGroup === "geriatric") {
        risks.push({
            severity: "info",
            message: "Geriatric patient. Apply gentle traction — fragile vein walls may rupture under pressure.",
        });
    }

    if (risks.length === 0) {
        risks.push({
            severity: "success",
            message: "No significant risk factors identified. Standard insertion procedure recommended.",
        });
    }

    return risks;
}

function getAlternatives(primaryGauge) {
    const gaugeOrder = ["16G", "18G", "20G", "22G", "24G"];
    const idx = gaugeOrder.indexOf(primaryGauge);
    const alternatives = [];

    if (idx > 0) {
        alternatives.push({
            gauge: gaugeOrder[idx - 1],
            reason: "Larger gauge — use if higher flow rate is needed",
            ...NEEDLE_SPECS[gaugeOrder[idx - 1]],
        });
    }
    if (idx < gaugeOrder.length - 1) {
        alternatives.push({
            gauge: gaugeOrder[idx + 1],
            reason: "Smaller gauge — use if vein is more fragile than expected",
            ...NEEDLE_SPECS[gaugeOrder[idx + 1]],
        });
    }

    return alternatives;
}

function buildReasoning({ veinDiameter, veinDepth, stabilityIndex, ageGroup, patientHistory, gauge, needleLength, successProbability }) {
    const steps = [];

    steps.push(`Vein diameter of ${veinDiameter}mm suggests ${selectBaseGauge(veinDiameter)} as baseline gauge.`);

    if (ageGroup !== "adult") {
        steps.push(`Adjusted for ${ageGroup} patient: shifted to more conservative gauge.`);
    }

    if (patientHistory !== "none") {
        steps.push(`Patient history (${patientHistory}) factored in: further gauge adjustment applied.`);
    }

    steps.push(`Vein depth of ${veinDepth}mm requires ${needleLength.label.toLowerCase()} needle (${needleLength.inches}).`);
    steps.push(`Stability index of ${stabilityIndex}/100 ${stabilityIndex >= 70 ? "supports" : "reduces"} confidence in first-attempt success.`);
    steps.push(`Final recommendation: ${gauge} gauge, ${needleLength.inches} length. Estimated success: ${Math.round(successProbability)}%.`);

    return steps;
}
