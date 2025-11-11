export const getPasswordSeverity = (count: number): string => {
  if (count === 0) return "SAFE";
  if (count < 100) return "LOW";
  if (count < 10000) return "MEDIUM";
  return "HIGH";
};