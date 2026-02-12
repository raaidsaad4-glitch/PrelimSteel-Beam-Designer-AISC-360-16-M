import { GoogleGenAI, Type } from "@google/genai";
import { DesignInputs, AnalysisReport } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const buildPrompt = (inputs: DesignInputs, heavierThan?: string): string => {
  const { parameters, loads, material, sectionStandard, sectionFamily, includeNotionalLoads } = inputs;

  const constraintSection = heavierThan
    ? `
    **Additional Constraint:**
    The previously selected section was '${heavierThan}'. For this new analysis, you MUST select a different, heavier (larger cross-sectional area or weight per meter) section from the same '${sectionFamily}' family that still meets all design requirements. Do not select '${heavierThan}' again. The goal is to find the *next* suitable, heavier section.`
    : '';

  return `
    Act as a professional structural engineer. Your task is to perform a complete steel beam design based on the provided inputs, following AISC 360-16 and ASCE 7-16 (LRFD) specifications. Use the Direct Analysis Method principles.

    **Design Inputs:**
    - Beam Type: ${parameters.beamType}
    - Span Length: ${parameters.span} m
    - Material Properties:
      - Yield Strength (Fy): ${material.fy} MPa
      - Ultimate Strength (Fu): ${material.fu} MPa
    - Unbraced Lengths:
      - Major Axis (Lb-major): ${parameters.lbMajor} m
      - Minor Axis (Lb-minor): ${parameters.lbMinor} m
      - LTB (Lb-LTB): ${parameters.lbLtb} m
    - Service Loads (Uniformly Distributed):
      - Dead Load (D): ${loads.deadLoad} kN/m
      - Live Load (L): ${loads.liveLoad} kN/m
      - Snow Load (S): ${loads.snowLoad} kN/m
      - Wind Load (W): ${loads.windLoad} kN/m
      - Other Load: ${loads.otherLoad} kN/m
    - Include Notional Loads: ${includeNotionalLoads}
    - Desired Section Database: ${sectionStandard}
    - Desired Section Family: ${sectionFamily}${constraintSection}

    **Analysis & Design Steps:**
    1.  **Load Combinations:** Generate all applicable LRFD load combinations from ASCE 7-16 using the provided loads (D, L, S, W).
    2.  **Governing Load:** Determine the governing load combination for strength that produces the maximum factored uniform load (wu).
    3.  **Internal Forces:** Based on the governing strength load (wu) and beam type, calculate the maximum factored moment (Mu) and maximum factored shear (Vu). Use standard formulas (e.g., for simply supported beam, Mu = wu * L^2 / 8, Vu = wu * L / 2).
    4.  **Section Selection:** Select the most economical, lightest standard section from the specified '${sectionFamily}' family within the '${sectionStandard}' database that can safely resist the calculated Mu and Vu. Use the provided Fy and Fu for all calculations.
    5.  **Strength Design Checks:** Perform the following design checks for the selected section according to AISC 360-16. Report each as a separate check item in the 'designChecks' array. For each check, provide the relevant formula used.
        - Flexural Strength (Chapter F): Calculate the overall design flexural strength (φbMn) considering yielding and lateral-torsional buckling (LTB) limit states. The demand is Mu.
        - Shear Strength (Chapter G): Calculate the design shear strength (φvVn). The demand is Vu.
        - Flange Local Buckling (FLB) Capacity (Chapter F): Report the design flexural strength (φbMn) as governed ONLY by the FLB limit state. The demand is Mu. This check helps identify if FLB is a controlling failure mode.
        - Web Local Yielding (WLY) at Supports (Chapter J): Based on AISC Section J10.2, calculate the design capacity (φRn) for web local yielding at the supports. The demand is the maximum reaction force (which is equal to Vu for the given beam types).
    6.  **Serviceability Checks:** Perform serviceability checks according to AISC Design Guides and ASCE 7-16. Report each as a separate check item in the 'serviceabilityChecks' array. This must include, at a minimum:
        - Live Load Deflection.
        - Total Load Deflection (D+L). The standard deflection limits are L/360 for live load and L/240 for total load. **Crucially, for Cantilever beams, the deflection limit calculation must use twice the span length (2L) as required by the IBC (e.g., the limit becomes (2L)/360).** You must state this adjustment in the check details.
        - **Vibration Analysis (AISC Design Guide 11):** Perform a simplified vibration check. Calculate the fundamental frequency of the beam (fn). Compare it against a recommended minimum frequency for walking vibrations (e.g., 4 Hz for floors). Report the calculated frequency, the limit, and the status. Provide details about the assumptions made (e.g., considering the beam alone).
    7.  **Cambering Evaluation:** Based on the unfactored dead load deflection, evaluate if cambering is required to compensate for it (e.g., to ensure a level floor). Provide a clear recommendation.
    8.  **Summary:** Provide a final conclusion on whether the selected beam is adequate for both strength and serviceability. The capacity ratio for each check should be Demand / Capacity.

    **Output Requirement:**
    You MUST return the entire output as a single, valid JSON object that adheres to the provided schema. Do not include any explanatory text, markdown formatting, or any content outside of the JSON object.
    For the 'selectedSection.properties' object, you must use the following keys: 'depth', 'flangeWidth', 'plasticModulusZx', and 'momentOfInertiaIx'. The values for these properties should be strings that include the numeric value and its unit (e.g., '457 mm').
  `;
};

const responseSchema: object = {
  type: Type.OBJECT,
  properties: {
    selectedSection: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "The standard name of the selected steel section, e.g., 'W18x35'." },
        standard: { type: Type.STRING, description: "The database or standard the section is from, e.g., 'AISC'." },
        properties: {
          type: Type.OBJECT,
          properties: {
            depth: { type: Type.STRING, description: "Overall depth of the section (d). Value as a string with units, e.g., '457 mm'." },
            flangeWidth: { type: Type.STRING, description: "Flange width (bf). Value as a string with units, e.g., '152 mm'." },
            plasticModulusZx: { type: Type.STRING, description: "Plastic section modulus about the major axis (Zx). Value as a string with units, e.g., '1080 cm^3'." },
            momentOfInertiaIx: { type: Type.STRING, description: "Moment of inertia about the major axis (Ix). Value as a string with units, e.g., '22800 cm^4'." },
          },
        },
      },
    },
    loadCombinations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          formula: { type: Type.STRING },
          factoredLoad: { type: Type.NUMBER },
        },
      },
    },
    governingCombination: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        factoredLoad: { type: Type.NUMBER },
      },
    },
    internalForces: {
      type: Type.OBJECT,
      properties: {
        moment: { type: Type.NUMBER },
        shear: { type: Type.NUMBER },
      },
    },
    designChecks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          checkName: { type: Type.STRING },
          demand: { type: Type.NUMBER },
          capacity: { type: Type.NUMBER },
          ratio: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ['Pass', 'Fail'] },
          formula: {type: Type.STRING}
        },
      },
    },
    serviceabilityChecks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          checkName: { type: Type.STRING },
          calculated: { type: Type.STRING },
          limit: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['Pass', 'Fail', 'N/A'] },
          details: { type: Type.STRING },
        }
      }
    },
    camberingInfo: {
        type: Type.OBJECT,
        properties: {
            isRequired: { type: Type.BOOLEAN },
            recommendation: { type: Type.STRING },
        }
    },
    summary: {
      type: Type.OBJECT,
      properties: {
        isAdequate: { type: Type.BOOLEAN },
        message: { type: Type.STRING },
      },
    },
  },
};


export const runBeamAnalysis = async (inputs: DesignInputs, heavierThan?: string): Promise<AnalysisReport> => {
  try {
    const prompt = buildPrompt(inputs, heavierThan);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Lower temperature for more deterministic, factual output
      },
    });
    
    if (!response.text) {
      console.error("Gemini API returned an empty text response. Full response object:", response);
      if (response.promptFeedback?.blockReason) {
        throw new Error(`Request blocked by API safety settings. Reason: ${response.promptFeedback.blockReason}. Please adjust your inputs and try again.`);
      }
      throw new Error("The AI model returned an empty response. This may be due to content filtering or a temporary API issue. Please try again.");
    }
    
    const jsonString = response.text.trim();
    
    try {
        const result = JSON.parse(jsonString);
        return result as AnalysisReport;
    } catch (parseError) {
        console.error("Failed to parse JSON response from Gemini API:", { parseError, jsonString });
        throw new Error("The AI model returned a malformed or incomplete response. This can happen with complex requests. Please try again.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("An unknown error occurred during AI analysis.");
  }
};