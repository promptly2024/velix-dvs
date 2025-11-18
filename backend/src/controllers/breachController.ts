import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HIBPClient } from "../lib/hibpClient";
import { HIBP_API_KEY } from "../config/env";
import crypto from "crypto";
import { isValidEmail } from "../helper/checkEmail";
import { calculateRiskLevel } from "../helper/riskLevel";
import { getPasswordSeverity } from "../helper/passwordSeverity";
import { delay } from "../middlewares/delay";
import { sendBreachNotificationEmail, sendPasswordBreachAlertEmail } from "../utils/emailService";

const hibpClient = new HIBPClient(HIBP_API_KEY);

export const checkEmail = async (req: Request, res: Response) => {
    const { email } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: "Valid email is required." });
    }

    try {
      const breaches = await hibpClient.checkEmailBreaches(email, false, true);
      const pastes = await hibpClient.checkEmailPastes(email);

      const breachCheck = await prisma.breachCheck.create({
        data: {
          userId,
          email,
          checkType: "EMAIL",
          breachesFound: breaches.length,
          breachRecords: {
            create: breaches.map((breach) => ({
              breachName: breach.Name,
              breachTitle: breach.Title,
              domain: breach.Domain,
              breachDate: new Date(breach.BreachDate),
              addedDate: new Date(breach.AddedDate),
              pwnCount: breach.PwnCount,
              description: breach.Description,
              dataClasses: breach.DataClasses,
              isVerified: breach.IsVerified,
              isSensitive: breach.IsSensitive,
              isRetired: breach.IsRetired,
              isFabricated: breach.IsFabricated,
            })),
          },
        },
        include: {
          breachRecords: true,
        },
      });

      // Create incident if breaches found
      if (breaches.length > 0) {
        const severity = breaches.length >= 10 ? "HIGH" : breaches.length >= 5 ? "MEDIUM" : "LOW";
        await prisma.incident.create({
          data: {
            userId,
            severity: severity as any,
            description: `Email found in ${breaches.length} data breach(es). Immediate action recommended.`,
          },
        });
      }
      
      // send email breach notification through bullmq worker 
      // const user = await prisma.user.findUnique({ 
      //     where: { id: userId },
      //     select: { email: true }
      //   });

        // if (user?.email) {
        //   try {
        //     await sendBreachNotificationEmail(
        //       user.email,
        //       email,
        //       breaches.length,
        //       breaches.slice(0, 5).map((b) => ({
        //         name: b.Title,
        //         date: b.BreachDate,
        //         dataClasses: b.DataClasses,
        //       }))
        //     );
        //     console.log(`Breach notification email sent to ${user.email}`);
        //   } catch (emailError) {
        //     console.error("Failed to send breach notification email:", emailError);
        //   }
        // }
      
      return res.status(200).json({
        success: true,
        data: {
          email,
          breachCount: breaches.length,
          pasteCount: pastes.length,
          riskLevel: calculateRiskLevel(breaches.length),
          breaches: breaches.map((b) => ({
            name: b.Name,
            title: b.Title,
            domain: b.Domain,
            breachDate: b.BreachDate,
            pwnCount: b.PwnCount,
            dataClasses: b.DataClasses,
            description: b.Description,
            isVerified: b.IsVerified,
            isSensitive: b.IsSensitive,
          })),
          pastes: pastes.map((p) => ({
            source: p.Source,
            title: p.Title,
            date: p.Date,
            emailCount: p.EmailCount,
          })),
          checkId: breachCheck.id,
        },
      });
    } catch (error: any) {
      console.error("Error checking email:", error);
      return res.status(500).json({
        error: "Failed to check email breach status.",
        message: error.message,
      });
    }
};

export const checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!password || password.length < 1) {
      return res.status(400).json({ error: "Password is required." });
    }

    try {
      const result = await hibpClient.checkPasswordPwned(password);

      const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

      await prisma.passwordCheck.create({
        data: {
          userId,
          passwordHash: passwordHash.substring(0, 16),
          isPwned: result.isPwned,
          pwnCount: result.count,
        },
      });

      if (result.isPwned && result.count > 100) {
        const severity = result.count > 10000 ? "HIGH" : "MEDIUM";
        await prisma.incident.create({
          data: {
            userId,
            severity: severity as any,
            description: `Password has been found in ${result.count} data breaches.`,
          },
        });
      }

      // Send email through bullmq worker not await the process
      //  const user = await prisma.user.findUnique({ 
      //     where: { id: userId },
      //     select: { email: true }
      //   });

      //   if (user?.email) {
      //     try {
      //       await sendPasswordBreachAlertEmail(
      //         user.email,
      //         result.count,
      //         getPasswordSeverity(result.count)
      //       );
      //       console.log(`Password breach alert sent to ${user.email}`);
      //     } catch (emailError) {
      //       console.error("Failed to send password breach alert:", emailError);
      //     }
      //   }

      return res.status(200).json({
        success: true,
        data: {
          isPwned: result.isPwned,
          pwnCount: result.count,
          severity: getPasswordSeverity(result.count),
          recommendation: result.isPwned
            ? "This password has been compromised. Change it immediately!"
            : "This password has not been found in known breaches.",
        },
      });
    } catch (error: any) {
      console.error("Error checking password:", error);
      return res.status(500).json({
        error: "Failed to check password breach status.",
        message: error.message,
      });
    }
};

export const checkBatchEmails = async (req: Request, res: Response) => {
    const { emails } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    if (!Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "Array of emails is required." });
    }

    if (emails.length > 10) {
      return res.status(400).json({ error: "Maximum 10 emails per batch request." });
    }

    try {
      const results = [];

      for (const email of emails) {
        if (!isValidEmail(email)) {
          results.push({ email, error: "Invalid email format", status: "failed" });
          continue;
        }

        try {
          const breaches = await hibpClient.checkEmailBreaches(email, true, true);

          results.push({
            email,
            breachCount: breaches.length,
            breaches: breaches.map((b) => b.Name),
            status: "checked",
          });

          await delay(2000);
        } catch (error: any) {
          results.push({
            email,
            error: error.message,
            status: "failed",
          });
        }
      }

      await prisma.breachCheck.create({
        data: {
          userId,
          email: emails.join(","),
          checkType: "BATCH",
          breachesFound: results.reduce((sum, r) => sum + (r.breachCount || 0), 0),
        },
      });

      return res.status(200).json({
        success: true,
        data: {
          totalChecked: emails.length,
          results,
        },
      });
    } catch (error: any) {
      console.error("Error in batch check:", error);
      return res.status(500).json({
        error: "Failed to process batch check.",
        message: error.message,
      });
    }
};

export const getBreachHistory = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { limit = "20", offset = "0" } = req.query;

  try {
    const checks = await prisma.breachCheck.findMany({
      where: { userId },
      include: {
        breachRecords: true,
      },
      orderBy: { checkedAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.breachCheck.count({ where: { userId } });

    return res.status(200).json({
      success: true,
      data: {
        checks,
        pagination: {
          total,
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching breach history:", error);
    return res.status(500).json({
      error: "Failed to fetch breach history.",
      message: error.message,
    });
  }
};

export const generateReport = async (req: Request, res: Response) => {
  const { checkId } = req.params;
  const userId = req.user?.userId;

  try {
    const check = await prisma.breachCheck.findFirst({
      where: {
        id: checkId,
        userId,
      },
      include: {
        breachRecords: true,
      },
    });

    if (!check) {
      return res.status(404).json({ error: "Breach check not found." });
    }

    const dataClasses = new Set<string>();
    check.breachRecords.forEach((b) => b.dataClasses.forEach((dc) => dataClasses.add(dc)));

    const recommendations = [
      "Change passwords immediately for all affected accounts",
      "Enable two-factor authentication (2FA) on all accounts",
      "Monitor your accounts for suspicious activity",
    ];

    if (dataClasses.has("Credit cards") || dataClasses.has("Financial transactions")) {
      recommendations.push("Monitor your credit card statements and credit report");
      recommendations.push("Consider placing a fraud alert on your credit file");
    }

    if (dataClasses.has("Social security numbers")) {
      recommendations.push("Consider identity theft protection services");
    }

    const report = {
      summary: {
        email: check.email,
        checkedAt: check.checkedAt,
        totalBreaches: check.breachesFound,
        riskLevel: calculateRiskLevel(check.breachesFound),
      },
      breaches: check.breachRecords.map((breach) => ({
        name: breach.breachTitle,
        domain: breach.domain,
        date: breach.breachDate,
        affectedAccounts: breach.pwnCount,
        compromisedData: breach.dataClasses,
        description: breach.description,
        verified: breach.isVerified,
        sensitive: breach.isSensitive,
      })),
      recommendations,
      actionItems: [
        {
          action: "Reset passwords on all breached services",
          priority: "CRITICAL",
        },
        {
          action: "Review and update security questions",
          priority: "HIGH",
        },
        {
          action: "Enable breach notifications",
          priority: "MEDIUM",
        },
      ],
    };

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    console.error("Error generating report:", error);
    return res.status(500).json({
      error: "Failed to generate report.",
      message: error.message,
    });
  }
};

export const getStatistics = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  try {
    const [totalChecks, totalBreaches, recentChecks, passwordChecks] = await Promise.all([
      prisma.breachCheck.count({ where: { userId } }),
      prisma.breachRecord.count({
        where: { breachCheck: { userId } },
      }),
      prisma.breachCheck.findMany({
        where: {
          userId,
          checkedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.passwordCheck.findMany({
        where: { userId, isPwned: true },
        orderBy: { checkedAt: "desc" },
        take: 5,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalChecks,
        totalBreaches,
        checksLast30Days: recentChecks.length,
        compromisedPasswords: passwordChecks.length,
        recentActivity: recentChecks.slice(0, 5),
      },
    });
  } catch (error: any) {
    console.error("Error fetching statistics:", error);
    return res.status(500).json({
      error: "Failed to fetch statistics.",
      message: error.message,
    });
  }
};
