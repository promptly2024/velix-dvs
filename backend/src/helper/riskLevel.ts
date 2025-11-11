export const calculateRiskLevel = (breachCount: number): string => {
  if (breachCount === 0) return "SAFE";
  if (breachCount < 3) return "LOW";
  if (breachCount < 10) return "MEDIUM";
  return "HIGH";
};