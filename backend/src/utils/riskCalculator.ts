import { ExposureLevel, PlatformType } from "@prisma/client";

export const calculateExposureLevel = (platformType: PlatformType): ExposureLevel => {
  switch (platformType) {
    case 'SOCIAL_MEDIA':
    case 'DATING':
      return 'HIGH';
    case 'PROFESSIONAL':
    case 'FORUM':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
};

export const calculateWebPresenceRisk = (findings: any[]): number => {
  let score = 0;
  
  findings.forEach(finding => {
    switch (finding.exposureLevel) {
      case 'HIGH':
        score += 10;
        break;
      case 'MEDIUM':
        score += 5;
        break;
      case 'LOW':
        score += 2;
        break;
    }
  });

  return Math.min(100, score);
};

export const calculateOverallRiskScore = (
  webPresenceRisk: number,
  breachCount: number,
  socialMediaCount: number
): number => {
  let risk = 0;

  risk += webPresenceRisk * 0.4;

  risk += Math.min(100, breachCount * 10) * 0.4;

  risk += Math.min(100, socialMediaCount * 5) * 0.2;

  return Math.round(Math.min(100, risk));
};