import * as functions from "firebase-functions/v2";
import {CallableRequest} from "firebase-functions/v2/https";
import {db, admin} from "../lib/firebase";
import {SecurityHelpers} from "../lib/securityHelpers";
import {logAudit, logUserActivity} from "../lib/auditService";

// Interface definitions
interface DigitalTwinConfig {
  userId: string;
  simulationType: "carbon_footprint" | "energy_optimization" |
    "waste_reduction" | "water_conservation";
  parameters: {
    timeframe: number; // days
    targetReduction: number; // percentage
    currentUsage: number;
    interventions: string[];
  };
  location?: string;
}

interface MSMEReportData {
  orgId: string;
  month: number;
  year: number;
  data: {
    scope1Emissions: number; // Direct emissions (kg CO2)
    scope2Emissions: number; // Indirect emissions from electricity (kg CO2)
    energyConsumption: number; // kWh
    waterUsage: number; // liters
    wasteGenerated: number; // kg
    wasteRecycled: number; // kg
    employeeCount: number;
    sustainabilityInitiatives: string[];
    certifications: string[];
  };
}

/**
 * Run Digital Twin simulation for sustainability predictions
 */
export const runDigitalTwinSimulation = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<DigitalTwinConfig>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["userId", "simulationType", "parameters"]);

      const {userId, simulationType, parameters, location} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Cannot run simulation for another user");
      }

      // Validate user exists and is active
      await SecurityHelpers.validateUser(userId);

      // Validate simulation type
      const validTypes = ["carbon_footprint", "energy_optimization", "waste_reduction", "water_conservation"];
      if (!validTypes.includes(simulationType)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid simulation type");
      }

      // Validate parameters
      const {timeframe, targetReduction, currentUsage, interventions} = parameters;
      SecurityHelpers.validateNumeric(timeframe, "timeframe", 1, 365);
      SecurityHelpers.validateNumeric(targetReduction, "targetReduction", 1, 100);
      SecurityHelpers.validateNumeric(currentUsage, "currentUsage", 0);

      if (!Array.isArray(interventions)) {
        throw new functions.https.HttpsError("invalid-argument", "Interventions must be an array");
      }

      // Run simulation calculations
      const simulationResults = await runSimulation(simulationType, parameters);

      // Execute transaction to save results
      const result = await db.runTransaction(async (transaction) => {
        const simId = SecurityHelpers.generateId("sim");

        // Create simulation record
        const simulationRef = db.collection("digitalTwin").doc(simId);
        const simulation = {
          simulationId: simId,
          userId,
          simulationType,
          parameters,
          results: simulationResults,
          location: location || "",
          status: "completed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        transaction.set(simulationRef, simulation);

        return simulation;
      });

      // Log audit trail
      await logAudit(
        "runDigitalTwinSimulation",
        userId,
        result.simulationId,
        {},
        {
          simulationType,
          timeframe,
          targetReduction,
          estimatedSavings: simulationResults.estimatedSavings,
          confidence: simulationResults.confidence,
        },
        "advancedFunctions"
      );

      // Log user activity
      await logUserActivity(
        userId,
        "digitalTwinSimulationRun",
        {
          simulationType,
          estimatedSavings: simulationResults.estimatedSavings,
        },
        "advancedFunctions"
      );

      return SecurityHelpers.createResponse("success", "Digital Twin simulation completed successfully", {
        simulation: result,
        results: simulationResults,
      });
    } catch (error) {
      console.error("Error in runDigitalTwinSimulation:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to run Digital Twin simulation");
    }
  });

/**
 * Generate MSME ESG sustainability report
 */
export const generateMSMEReport = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<MSMEReportData>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      // Validate required parameters
      SecurityHelpers.validateRequired(request.data, ["orgId", "month", "year", "data"]);

      const {orgId, month, year, data: reportData} = request.data;

      // Validate organization access (simplified - in production, check user's org membership)
      const orgDoc = await db.collection("organizations").doc(orgId).get();
      if (!orgDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Organization not found");
      }

      const orgData = orgDoc.data();
      if (!orgData?.members?.includes(authUserId) && orgData?.ownerId !== authUserId) {
        throw new functions.https.HttpsError(
          "permission-denied",
          "Not authorized to generate reports for this organization"
        );
      }

      // Validate month and year
      SecurityHelpers.validateNumeric(month, "month", 1, 12);
      SecurityHelpers.validateNumeric(year, "year", 2020, new Date().getFullYear());

      // Validate report data
      const requiredFields = ["scope1Emissions", "scope2Emissions", "energyConsumption", "waterUsage", "wasteGenerated", "employeeCount"];
      SecurityHelpers.validateRequired(reportData, requiredFields);

      // Calculate sustainability metrics
      const metrics = calculateSustainabilityMetrics(reportData);

      // Generate report content
      const reportContent = generateReportContent(orgData, month, year, reportData, metrics);

      // Execute transaction to save report
      const result = await db.runTransaction(async (transaction) => {
        const reportId = SecurityHelpers.generateId("rpt");

        // Create MSME report record
        const reportRef = db.collection("msmeReports").doc(reportId);
        const report = {
          reportId,
          orgId,
          month,
          year,
          data: reportData,
          metrics,
          reportContent,
          status: "generated",
          generatedBy: authUserId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        transaction.set(reportRef, report);

        return report;
      });

      // In a real implementation, you would generate a PDF here
      // For now, we'll simulate PDF generation
      const pdfUrl = await generatePDFReport({
        reportId: result.reportId,
        orgId,
        reportContent,
      });

      // Update report with PDF URL
      const versionId = `v_${Date.now().toString(36)}`;
      const hash = Buffer.from(JSON.stringify(reportContent)).toString("base64").slice(0, 16);
      await db.collection("msmeReports").doc(result.reportId).update({
        pdfUrl,
        pdfGeneratedAt: new Date().toISOString(),
        versionId,
        contentHash: hash,
      });

      // Log audit trail
      await logAudit(
        "generateMSMEReport",
        authUserId,
        result.reportId,
        {},
        {
          orgId,
          month,
          year,
          totalEmissions: metrics.totalEmissions,
          sustainabilityScore: metrics.sustainabilityScore,
        },
        "advancedFunctions"
      );

      // Log user activity
      await logUserActivity(
        authUserId,
        "msmeReportGenerated",
        {
          orgId,
          month,
          year,
          sustainabilityScore: metrics.sustainabilityScore,
        },
        "advancedFunctions"
      );

      return SecurityHelpers.createResponse("success", "MSME ESG report generated successfully", {
        report: {
          reportId: result.reportId,
          orgId,
          month,
          year,
          metrics,
          pdfUrl,
          createdAt: result.createdAt,
        },
      });
    } catch (error) {
      console.error("Error in generateMSMEReport:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to generate MSME report");
    }
  });

/**
 * Get Digital Twin simulation history
 */
export const getSimulationHistory = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ userId: string, limit?: number }>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      const {userId, limit = 10} = request.data;

      // Ensure authenticated user matches the userId
      if (authUserId !== userId) {
        throw new functions.https.HttpsError("permission-denied", "Cannot view another user's simulation history");
      }

      // Get simulation history
      const simulationsQuery = await db.collection("digitalTwinSimulations")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(Math.min(limit, 50))
        .get();

      const simulations = simulationsQuery.docs.map((doc) => ({
        simulationId: doc.id,
        ...doc.data(),
      }));

      return SecurityHelpers.createResponse("success", "Simulation history retrieved", {
        simulations,
        count: simulations.length,
      });
    } catch (error) {
      console.error("Error in getSimulationHistory:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to get simulation history");
    }
  });

/**
 * Get MSME reports for organization
 */
export const getMSMEReports = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ orgId: string, year?: number }>) => {
    try {
    // Validate authentication
      const authUserId = SecurityHelpers.validateAuth(request);

      const {orgId, year} = request.data;

      // Validate organization access
      const orgDoc = await db.collection("organizations").doc(orgId).get();
      if (!orgDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Organization not found");
      }

      const orgData = orgDoc.data();
      if (!orgData?.members?.includes(authUserId) && orgData?.ownerId !== authUserId) {
        throw new functions.https.HttpsError("permission-denied", "Not authorized to view reports for this organization");
      }

      // Build query
      let query = db.collection("msmeReports").where("orgId", "==", orgId);

      if (year) {
        query = query.where("year", "==", year);
      }

      const reportsQuery = await query.orderBy("year", "desc").orderBy("month", "desc").get();

      const reports = reportsQuery.docs.map((doc) => ({
        reportId: doc.id,
        ...doc.data(),
      }));

      return SecurityHelpers.createResponse("success", "MSME reports retrieved", {
        reports,
        count: reports.length,
      });
    } catch (error) {
      console.error("Error in getMSMEReports:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to get MSME reports");
    }
  });

/**
 * Get MSME trends and percentage changes across months
 */
export const getMSMETrends = functions.https.onCall(
  {region: "asia-south1"},
  async (request: CallableRequest<{ orgId: string; start?: string; end?: string }>) => {
    try {
      const authUserId = SecurityHelpers.validateAuth(request);
      const {orgId, start, end} = request.data;

      // Validate organization access
      const orgDoc = await db.collection("organizations").doc(orgId).get();
      if (!orgDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Organization not found");
      }
      const orgData = orgDoc.data();
      if (!orgData?.members?.includes(authUserId) && orgData?.ownerId !== authUserId) {
        throw new functions.https.HttpsError("permission-denied", "Not authorized to view reports for this organization");
      }

      // Build query window
      const query = db.collection("msmeReports").where("orgId", "==", orgId);
      const reportsSnap = await query.get();
      const reports = reportsSnap.docs.map((d) => ({id: d.id, ...(d.data() as any)}));

      // Normalize to month key YYYY-MM
      const inWindow = (r: any) => {
        const key = `${r.year?.toString().padStart(4, "0")}-${(r.month || 0).toString().padStart(2, "0")}`;
        if (start && key < start) return false;
        if (end && key > end) return false;
        return true;
      };

      const filtered = reports.filter(inWindow);

      // Sort ascending by year, month
      filtered.sort((a, b) => {
        const ka = `${a.year.toString().padStart(4, "0")}-${(a.month || 0).toString().padStart(2, "0")}`;
        const kb = `${b.year.toString().padStart(4, "0")}-${(b.month || 0).toString().padStart(2, "0")}`;
        return ka.localeCompare(kb);
      });

      const months: string[] = [];
      const series: Record<string, number[]> = {
        totalEmissions: [],
        scope3Emissions: [],
        totalEmissionsWithScope3: [],
        energyConsumption: [],
        waterUsage: [],
        wasteGenerated: [],
        sustainabilityScore: [],
      };

      filtered.forEach((r: any) => {
        const key = `${r.year.toString().padStart(4, "0")}-${(r.month || 0).toString().padStart(2, "0")}`;
        months.push(key);
        const m = r.metrics || {};
        series.totalEmissions.push(Number(m.totalEmissions ?? 0));
        series.scope3Emissions.push(Number(m.scope3Emissions ?? r.data?.scope3Emissions ?? 0));
        series.totalEmissionsWithScope3.push(Number(m.totalEmissionsWithScope3 ?? (Number(m.totalEmissions ?? 0) + Number(r.data?.scope3Emissions ?? 0))));
        series.energyConsumption.push(Number(r.data?.energyConsumption ?? m.energyConsumption ?? 0));
        series.waterUsage.push(Number(r.data?.waterUsage ?? m.waterUsage ?? 0));
        series.wasteGenerated.push(Number(r.data?.wasteGenerated ?? m.wasteGenerated ?? 0));
        series.sustainabilityScore.push(Number(m.sustainabilityScore ?? 0));
      });

      const pct = (cur: number, prev: number) => {
        if (prev === 0) return null as any;
        return Math.round(((cur - prev) / prev) * 10000) / 100; // % with 2 decimals
      };

      const pctChanges: Record<string, number | null> = {} as any;
      Object.keys(series).forEach((k) => {
        const arr = series[k];
        if (arr.length < 2) {
          pctChanges[k] = null;
        } else {
          pctChanges[k] = pct(arr[arr.length - 1], arr[arr.length - 2]);
        }
      });

      return SecurityHelpers.createResponse("success", "MSME trends computed", {
        months,
        series,
        pctChanges,
        count: months.length,
      });
    } catch (error) {
      console.error("Error in getMSMETrends:", error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError("internal", "Failed to compute MSME trends");
    }
  }
);
/**
 * Run simulation calculations based on type and parameters
 */
async function runSimulation(simulationType: string, parameters: any) {
  const {timeframe, targetReduction, currentUsage, interventions} = parameters;

  // Simplified simulation logic - in production, use ML models
  let baselineEmissions = 0;
  let potentialSavings = 0;
  let confidence = 0.8;

  switch (simulationType) {
  case "carbon_footprint":
    baselineEmissions = currentUsage * 0.5; // kg CO2 per unit
    potentialSavings = baselineEmissions * (targetReduction / 100);
    confidence = Math.min(0.95, 0.7 + (interventions.length * 0.05));
    break;

  case "energy_optimization":
    baselineEmissions = currentUsage * 0.4; // kg CO2 per kWh
    potentialSavings = baselineEmissions * (targetReduction / 100);
    confidence = Math.min(0.9, 0.75 + (interventions.length * 0.03));
    break;

  case "waste_reduction":
    baselineEmissions = currentUsage * 0.1; // kg CO2 per kg waste
    potentialSavings = baselineEmissions * (targetReduction / 100);
    confidence = Math.min(0.85, 0.6 + (interventions.length * 0.08));
    break;

  case "water_conservation":
    baselineEmissions = currentUsage * 0.001; // kg CO2 per liter
    potentialSavings = baselineEmissions * (targetReduction / 100);
    confidence = Math.min(0.8, 0.65 + (interventions.length * 0.04));
    break;
  }

  return {
    baselineEmissions: Math.round(baselineEmissions * 100) / 100,
    estimatedSavings: Math.round(potentialSavings * 100) / 100,
    projectedReduction: targetReduction,
    timeframe,
    confidence: Math.round(confidence * 100) / 100,
    interventions,
    recommendations: generateRecommendations(simulationType, interventions),
  };
}

/**
 * Calculate sustainability metrics for MSME report
 */
function calculateSustainabilityMetrics(data: any) {
  const totalEmissions = data.scope1Emissions + data.scope2Emissions;
  const scope3 = data.scope3Emissions ? Number(data.scope3Emissions) : 0;
  const totalWithScope3 = totalEmissions + scope3;
  const emissionsPerEmployee = totalEmissions / data.employeeCount;
  const wasteRecyclingRate = (data.wasteRecycled / data.wasteGenerated) * 100;
  const energyIntensity = data.energyConsumption / data.employeeCount;
  const waterIntensity = data.waterUsage / data.employeeCount;

  // Calculate sustainability score (0-100)
  let sustainabilityScore = 50; // Base score

  // Adjust based on emissions per employee
  if (emissionsPerEmployee < 1000) sustainabilityScore += 20;
  else if (emissionsPerEmployee < 2000) sustainabilityScore += 10;

  // Adjust based on recycling rate
  if (wasteRecyclingRate > 80) sustainabilityScore += 15;
  else if (wasteRecyclingRate > 50) sustainabilityScore += 10;
  else if (wasteRecyclingRate > 20) sustainabilityScore += 5;

  // Adjust based on initiatives and certifications
  sustainabilityScore += Math.min(15, data.sustainabilityInitiatives.length * 3);
  sustainabilityScore += Math.min(10, data.certifications.length * 5);

  return {
    totalEmissions: Math.round(totalEmissions * 100) / 100,
    scope3Emissions: Math.round(scope3 * 100) / 100,
    totalEmissionsWithScope3: Math.round(totalWithScope3 * 100) / 100,
    emissionsPerEmployee: Math.round(emissionsPerEmployee * 100) / 100,
    wasteRecyclingRate: Math.round(wasteRecyclingRate * 100) / 100,
    energyIntensity: Math.round(energyIntensity * 100) / 100,
    waterIntensity: Math.round(waterIntensity * 100) / 100,
    sustainabilityScore: Math.min(100, Math.round(sustainabilityScore)),
  };
}

/**
 * Generate report content
 */
function generateReportContent(orgData: any, month: number, year: number, data: any, metrics: any) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return {
    title: `ESG Sustainability Report - ${monthNames[month - 1]} ${year}`,
    organization: orgData.name || "Organization",
    period: `${monthNames[month - 1]} ${year}`,
    summary: {
      totalEmissions: metrics.totalEmissions,
      sustainabilityScore: metrics.sustainabilityScore,
      employeeCount: data.employeeCount,
      wasteRecyclingRate: metrics.wasteRecyclingRate,
    },
    sections: [
      {
        title: "Executive Summary",
        content: `This report presents the sustainability performance for ${monthNames[month - 1]} ${year}. ` +
          `The organization achieved a sustainability score of ${metrics.sustainabilityScore}/100.`,
      },
      {
        title: "Scope 1 & 2 Emissions",
        content: `Total emissions: ${metrics.totalEmissions} kg CO2. ` +
          `Scope 1: ${data.scope1Emissions} kg CO2, Scope 2: ${data.scope2Emissions} kg CO2.`,
      },
      {
        title: "Resource Consumption",
        content: `Energy: ${data.energyConsumption} kWh, Water: ${data.waterUsage} liters, Waste generated: ${data.wasteGenerated} kg.`,
      },
      {
        title: "Sustainability Initiatives",
        content: `Active initiatives: ${data.sustainabilityInitiatives.join(", ")}. Certifications: ${data.certifications.join(", ")}.`,
      },
    ],
  };
}

/**
 * Generate PDF report (mock implementation)
 */
async function generatePDFReport(args: {reportId: string, orgId: string, reportContent: any}): Promise<string> {
  const {reportId, orgId, reportContent} = args;

  const summaryLines = [
    `Report ID: ${reportId}`,
    `Organization: ${reportContent.organization}`,
    `Period: ${reportContent.period}`,
    `Total Emissions: ${reportContent.summary.totalEmissions} kg CO2`,
    `Sustainability Score: ${reportContent.summary.sustainabilityScore}/100`,
  ];

  const pdfBuffer = createSimplePdf(summaryLines);

  const bucket = admin.storage().bucket();
  const filePath = `msme-reports/${orgId}/${reportId}.pdf`;
  const file = bucket.file(filePath);

  await file.save(pdfBuffer, {
    contentType: "application/pdf",
    metadata: {
      cacheControl: "no-store",
    },
  });

  const [signedUrl] = await file.getSignedUrl({
    version: "v4",
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 1 hour validity
  });

  return signedUrl;
}

function createSimplePdf(lines: string[]): Buffer {
  const escapeText = (value: string) => value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  const textOps = lines
    .map((line, index) => `(${escapeText(line)}) Tj${index < lines.length - 1 ? " T*" : ""}`)
    .join("\n");

  const streamContent = `BT /F1 12 Tf 14 TL 72 720 Td\n${textOps}\nET`;
  const streamLength = Buffer.byteLength(streamContent, "utf8");

  const objects = [
    "1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n",
    "2 0 obj<< /Type /Pages /Count 1 /Kids [3 0 R] >>endobj\n",
    "3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n",
    `4 0 obj<< /Length ${streamLength} >>stream\n${streamContent}\nendstream\nendobj\n`,
    "5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\n",
  ];

  const header = "%PDF-1.4\n";
  const offsets: number[] = [0];
  let position = Buffer.byteLength(header, "utf8");
  let body = "";

  for (const object of objects) {
    offsets.push(position);
    body += object;
    position += Buffer.byteLength(object, "utf8");
  }

  const xrefOffset = position;
  let xref = `xref\n0 ${offsets.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i++) {
    const offsetStr = offsets[i].toString().padStart(10, "0");
    xref += `${offsetStr} 00000 n \n`;
  }

  const trailer = `trailer<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const pdfString = header + body + xref + trailer;
  return Buffer.from(pdfString, "utf8");
}

/**
 * Generate recommendations based on simulation type and interventions
 */
function generateRecommendations(simulationType: string, interventions: string[]): string[] {
  const recommendations: { [key: string]: string[] } = {
    carbon_footprint: [
      "Switch to renewable energy sources",
      "Implement energy-efficient lighting",
      "Optimize transportation routes",
      "Encourage remote work to reduce commuting",
    ],
    energy_optimization: [
      "Install smart thermostats",
      "Upgrade to LED lighting",
      "Implement energy monitoring systems",
      "Use energy-efficient appliances",
    ],
    waste_reduction: [
      "Implement comprehensive recycling program",
      "Reduce single-use items",
      "Compost organic waste",
      "Partner with waste-to-energy facilities",
    ],
    water_conservation: [
      "Install low-flow fixtures",
      "Implement rainwater harvesting",
      "Fix leaks promptly",
      "Use drought-resistant landscaping",
    ],
  };

  const baseRecommendations = recommendations[simulationType] || [];

  // Filter out interventions already being implemented
  return baseRecommendations.filter((rec) =>
    !interventions.some((intervention) =>
      rec.toLowerCase().includes(intervention.toLowerCase())
    )
  ).slice(0, 3); // Return top 3 recommendations
}
