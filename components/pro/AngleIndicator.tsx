"use client";

interface Props {
  currentYaw: number | null;
  targetYaw:  number;
  tolerance:  number; // degrees
  label:      string;
  captured:   boolean;
}

export default function AngleIndicator({
  currentYaw,
  targetYaw,
  tolerance,
  label,
  captured,
}: Props) {
  const diff = currentYaw != null ? Math.abs(currentYaw - targetYaw) : Infinity;
  const inRange = diff <= tolerance;

  const borderColor = captured
    ? "border-ok"
    : inRange
    ? "border-ok"
    : "border-border";

  const textColor = captured ? "text-ok" : inRange ? "text-ok" : "text-muted";

  return (
    <div
      className={`flex flex-col items-center gap-1 border ${borderColor}
                  rounded-lg px-3 py-2 min-w-[72px] transition-colors duration-150`}
    >
      <span className={`text-xs font-medium ${textColor} transition-colors duration-150`}>
        {label}
      </span>
      {captured ? (
        <span className="text-ok text-lg leading-none">✓</span>
      ) : currentYaw != null ? (
        <span className={`text-xs tabular-nums ${inRange ? "text-ok" : "text-fg/50"}`}>
          {currentYaw > 0 ? "+" : ""}{Math.round(currentYaw)}°
        </span>
      ) : (
        <span className="text-xs text-muted">—</span>
      )}
    </div>
  );
}
