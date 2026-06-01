export type HeatRiskLevel = "bajo" | "medio" | "alto";

export type BusStop = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  colonia: string;
  hasShade: boolean;
  hasRoof: boolean;
  hasBench: boolean;
  hasLighting: boolean;
  heatRisk: HeatRiskLevel;
  comments: string;
  updatedAt: string;
};

export type StopFilters = {
  shadeOnly: boolean;
  roofOnly: boolean;
  benchOnly: boolean;
  lightingOnly: boolean;
  risk: "all" | HeatRiskLevel;
};
