import { BusStop, HeatRiskLevel } from "@/types/stop";

const RISK_ORDER: Record<HeatRiskLevel, number> = {
  bajo: 1,
  medio: 2,
  alto: 3,
};

export function calculateHeatRisk(stop: BusStop): HeatRiskLevel {
  let score = 0;

  if (!stop.hasShade) score += 2;
  if (!stop.hasRoof) score += 2;
  if (!stop.hasBench) score += 1;
  if (!stop.hasLighting) score += 1;

  if (score <= 1) return "bajo";
  if (score <= 3) return "medio";
  return "alto";
}

export function getDominantRisk(stop: BusStop): HeatRiskLevel {
  const computed = calculateHeatRisk(stop);
  return RISK_ORDER[computed] > RISK_ORDER[stop.heatRisk] ? computed : stop.heatRisk;
}

export function riskColor(risk: HeatRiskLevel): string {
  if (risk === "bajo") return "#047857";
  if (risk === "medio") return "#b45309";
  return "#b91c1c";
}

export function riskLabel(risk: HeatRiskLevel): string {
  if (risk === "bajo") return "Bajo";
  if (risk === "medio") return "Medio";
  return "Alto";
}
