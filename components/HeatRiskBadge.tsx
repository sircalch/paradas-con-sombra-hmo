import { getDominantRisk, riskLabel } from "@/lib/risk-score";
import { BusStop, HeatRiskLevel } from "@/types/stop";

type HeatRiskBadgeProps = {
  stop?: BusStop;
  risk?: HeatRiskLevel;
};

export function HeatRiskBadge({ stop, risk }: HeatRiskBadgeProps) {
  const finalRisk = stop ? getDominantRisk(stop) : risk ?? "medio";

  const className =
    finalRisk === "bajo"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : finalRisk === "medio"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-rose-200 bg-rose-50 text-rose-700";

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      Riesgo {riskLabel(finalRisk)}
    </span>
  );
}
