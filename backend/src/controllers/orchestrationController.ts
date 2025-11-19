import { Request, Response } from "express";
import { uploadDocumentHandler } from "./doccontroller";
import { checkEmail, checkPassword } from "./breachController";
import { scanWebPresenceWithPerplexity } from "./perplexitySearchController";
import { scanWebPresence } from "./webPresenceController";
import { processScanData } from "../services/scanProcessor";

interface ScanResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ComprehensiveScanResponse {
  overallStatus: "completed" | "partial" | "failed";
  timestamp: string;
  results: {
    emailBreach: ScanResult;
    passwordCheck: ScanResult;
    documentAnalysis: ScanResult;
    webPresencePerplexity: ScanResult;
    webPresenceGoogle: ScanResult;
  };
  summary: {
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    criticalIssuesFound: number;
  };
}

const captureControllerResponse = async (
  controllerFn: (req: Request, res: Response) => Promise<any>,
  req: Request
): Promise<ScanResult> => {
  return new Promise((resolve) => {
    const mockRes = {
      status: (code: number) => {
        const statusObj = {
          json: (data: any) => {
            if (code >= 200 && code < 300) {
              resolve({ success: true, data });
            } else {
              resolve({
                success: false,
                error: data.error || data.message || "Operation failed",
              });
            }
            return mockRes;
          },
          send: (data: any) => {
            resolve({ success: true, data });
            return mockRes;
          },
        };
        return statusObj;
      },
      json: (data: any) => {
        resolve({ success: true, data });
        return mockRes;
      },

      send: (data: any) => {
        resolve({ success: true, data });
        return mockRes;
      },
      end: () => {
        resolve({ success: true, data: {} });
        return mockRes;
      },
    } as any;

    try {
      controllerFn(req, mockRes).catch((error) => {
        resolve({
          success: false,
          error: error.message || "Operation failed",
        });
      });
    } catch (error: any) {
      resolve({
        success: false,
        error: error.message || "Operation failed",
      });
    }
  });
};

export const runParallelSecurityScan = async (
  req: Request,
  res: Response
) => {
  const userId = req.user?.userId;
  const { email, password } = req.body;
  const file = req.file;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  if (!email) {
    return res
      .status(400)
      .json({ error: "Email is required for comprehensive scan." });
  }

  const timestamp = new Date().toISOString();

  try {
    const emailReq = {
      ...req,
      body: { email },
      user: { userId },
    } as Request;

    const passwordReq = {
      ...req,
      body: { password },
      user: { userId },
    } as Request;

    const documentReq = {
      ...req,
      file: file,
      user: { userId },
    } as Request;

    const webPresencePerplexityReq = {
      ...req,
      body: { email },
      user: { userId },
    } as Request;

    const webPresenceGoogleReq = {
      ...req,
      body: { email },
      user: { userId },
    } as Request;

    const [
      emailResult,
      passwordResult,
      documentResult,
      webPresencePerplexityResult,
      webPresenceGoogleResult,
    ] = await Promise.allSettled([
      // Email breach check
      email
        ? captureControllerResponse(checkEmail, emailReq)
        : Promise.resolve({
          success: true,
          data: { skipped: true, reason: "No email provided" },
        }),

      // Password check (only if password provided)
      password
        ? captureControllerResponse(checkPassword, passwordReq)
        : Promise.resolve({
          success: true,
          data: { skipped: true, reason: "No password provided" },
        }),

      // Document analysis (only if file provided)
      file
        ? captureControllerResponse(uploadDocumentHandler, documentReq)
        : Promise.resolve({
          success: true,
          data: { skipped: true, reason: "No document provided" },
        }),

      // Web presence scan with Perplexity
      captureControllerResponse(
        scanWebPresenceWithPerplexity,
        webPresencePerplexityReq
      ),

      // Web presence scan with Google 
      captureControllerResponse(scanWebPresence, webPresenceGoogleReq),
    ]);

    const results: ComprehensiveScanResponse["results"] = {
      emailBreach:
        emailResult.status === "fulfilled"
          ? emailResult.value
          : {
            success: false,
            error:
              emailResult.status === "rejected"
                ? emailResult.reason
                : "Email breach check failed",
          },
      passwordCheck:
        passwordResult.status === "fulfilled"
          ? passwordResult.value
          : {
            success: false,
            error:
              passwordResult.status === "rejected"
                ? passwordResult.reason
                : "Password check failed",
          },
      documentAnalysis:
        documentResult.status === "fulfilled"
          ? documentResult.value
          : {
            success: false,
            error:
              documentResult.status === "rejected"
                ? documentResult.reason
                : "Document analysis failed",
          },
      webPresencePerplexity:
        webPresencePerplexityResult.status === "fulfilled"
          ? webPresencePerplexityResult.value
          : {
            success: false,
            error:
              webPresencePerplexityResult.status === "rejected"
                ? webPresencePerplexityResult.reason
                : "Perplexity web presence scan failed",
          },
      webPresenceGoogle:
        webPresenceGoogleResult.status === "fulfilled"
          ? webPresenceGoogleResult.value
          : {
            success: false,
            error:
              webPresenceGoogleResult.status === "rejected"
                ? webPresenceGoogleResult.reason
                : "Google web presence scan failed",
          },
    };

    const successfulChecks = Object.values(results).filter(
      (r) => r.success && !r.data?.skipped
    ).length;
    const totalChecks = Object.keys(results).length;
    const skippedChecks = Object.values(results).filter(
      (r) => r.data?.skipped
    ).length;

    let criticalIssuesFound = 0;

    if (results.emailBreach.success && !results.emailBreach.data?.skipped) {
      const breachCount =
        results.emailBreach.data?.data?.breachCount ||
        results.emailBreach.data?.breachCount;
      if (breachCount) {
        criticalIssuesFound += breachCount;
      }
    }

    if (results.passwordCheck.success && !results.passwordCheck.data?.skipped) {
      const isPwned =
        results.passwordCheck.data?.data?.isPwned ||
        results.passwordCheck.data?.isPwned;
      if (isPwned) {
        criticalIssuesFound += 1;
      }
    }

    if (
      results.documentAnalysis.success &&
      !results.documentAnalysis.data?.skipped
    ) {
      const docData =
        results.documentAnalysis.data?.data || results.documentAnalysis.data;
      if (docData?.pan || docData?.aadhaar || docData?.creditCard) {
        criticalIssuesFound += 1;
      }
    }

    if (
      results.webPresenceGoogle.success &&
      !results.webPresenceGoogle.data?.skipped
    ) {
      const googleData =
        results.webPresenceGoogle.data?.data || results.webPresenceGoogle.data;
      const totalFindings = googleData?.totalFindings || 0;
      const riskScore = googleData?.riskScore || 0;

      if (riskScore > 70 || totalFindings > 10) {
        criticalIssuesFound += 1;
      }
    }

    const overallStatus: ComprehensiveScanResponse["overallStatus"] =
      successfulChecks === totalChecks - skippedChecks
        ? "completed"
        : successfulChecks > 0
          ? "partial"
          : "failed";

    const response: ComprehensiveScanResponse = {
      overallStatus,
      timestamp,
      results,
      summary: {
        totalChecks,
        successfulChecks,
        failedChecks: totalChecks - successfulChecks - skippedChecks,
        criticalIssuesFound,
      },
    };

    const analyzeData = await processScanData(response, userId);
    return res.status(200).json({
      analyzeData,
      success: true,
      message: "Comprehensive security scan completed",
      ...response,
    });
  } catch (error: any) {
    console.error("Comprehensive scan error:", error);
    return res.status(500).json({
      success: false,
      error: "Comprehensive scan failed",
      message: error.message,
    });
  }
};
