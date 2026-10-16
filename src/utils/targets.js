// Konfigurasi ambang batas (threshold) rasio BJDPL untuk indikator kesehatan portofolio
export const RATIO_TARGETS = {
  // Ambang batas Rasio ALL BJDPL terhadap OSL (%)
  maxAllBjdplRatio: 1.5,
  // Ambang batas Rasio BJDPL > 60 Hari terhadap OSL (%)
  maxOver60Ratio: 0.25,
};

export function evaluateRatioHealth(ratioPercent, threshold = RATIO_TARGETS.maxAllBjdplRatio) {
  if (ratioPercent <= 0) return 'excellent';
  if (ratioPercent <= threshold * 0.6) return 'good';
  if (ratioPercent <= threshold) return 'warning';
  return 'critical';
}
