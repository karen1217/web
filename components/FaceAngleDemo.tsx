"use client";

import type { CSSProperties } from "react";

export type FaceMetric = "yaw" | "pitch" | "roll" | "brightness";

interface Props {
  metric: FaceMetric;
  /**
   * When omitted → looping conceptual demo animation.
   * When set without animate → static at this angle.
   * When set with animate=true → oscillates 0 ↔ angle (actual-value animation).
   */
  angle?: number;
  animate?: boolean;
  size?: number;
}

/** Deterministic keyframe name so the same metric+angle never injects twice. */
function actualAnimId(metric: FaceMetric, angle: number): string {
  const sign = angle < 0 ? "n" : "p";
  return `al-${metric}-a${Math.abs(angle).toFixed(0)}${sign}`;
}

function buildActualKeyframe(name: string, metric: FaceMetric, angle: number): string {
  switch (metric) {
    case "yaw":
      return `@keyframes ${name}{0%,15%{transform:perspective(280px) rotateY(0deg)}45%,65%{transform:perspective(280px) rotateY(${angle}deg)}90%,100%{transform:perspective(280px) rotateY(0deg)}}`;
    case "pitch":
      return `@keyframes ${name}{0%,15%{transform:perspective(280px) rotateX(0deg)}45%,65%{transform:perspective(280px) rotateX(${-angle}deg)}90%,100%{transform:perspective(280px) rotateX(0deg)}}`;
    case "roll":
      return `@keyframes ${name}{0%,15%{transform:rotate(0deg)}45%,65%{transform:rotate(${angle}deg)}90%,100%{transform:rotate(0deg)}}`;
    case "brightness": {
      const peak = Math.max(0.4, 1 + angle / 45).toFixed(2);
      return `@keyframes ${name}{0%,15%{filter:brightness(1)}45%,65%{filter:brightness(${peak})}90%,100%{filter:brightness(1)}}`;
    }
  }
}

const DEMO_KEYFRAMES = `
@keyframes al-yaw{0%,15%{transform:perspective(280px) rotateY(0deg)}40%,60%{transform:perspective(280px) rotateY(48deg)}85%,100%{transform:perspective(280px) rotateY(0deg)}}
@keyframes al-pitch{0%,15%{transform:perspective(280px) rotateX(0deg)}40%,60%{transform:perspective(280px) rotateX(-32deg)}85%,100%{transform:perspective(280px) rotateX(0deg)}}
@keyframes al-roll{0%,15%{transform:rotate(0deg)}40%,60%{transform:rotate(28deg)}85%,100%{transform:rotate(0deg)}}
@keyframes al-bright{0%,15%{filter:brightness(0.65)}40%,60%{filter:brightness(2.3)}85%,100%{filter:brightness(0.65)}}
`;

function resolveStyle(metric: FaceMetric, angle: number | undefined, animate: boolean | undefined): CSSProperties {
  if (angle !== undefined && animate) {
    return { animation: `${actualAnimId(metric, angle)} 3.6s ease-in-out infinite` };
  }
  if (angle !== undefined) {
    switch (metric) {
      case "yaw":        return { transform: `perspective(280px) rotateY(${angle}deg)` };
      case "pitch":      return { transform: `perspective(280px) rotateX(${-angle}deg)` };
      case "roll":       return { transform: `rotate(${angle}deg)` };
      case "brightness": return { filter: `brightness(${Math.max(0.4, 1 + angle / 45)})` };
    }
  }
  const name = metric === "brightness" ? "al-bright" : `al-${metric}`;
  return { animation: `${name} 3.6s ease-in-out infinite` };
}

export default function FaceAngleDemo({ metric, angle, animate, size = 80 }: Props) {
  const extraKeyframe =
    angle !== undefined && animate
      ? buildActualKeyframe(actualAnimId(metric, angle), metric, angle)
      : "";

  const faceStyle = resolveStyle(metric, angle, animate);

  return (
    <>
      <style>{DEMO_KEYFRAMES}{extraKeyframe}</style>
      <div
        style={{
          width: size,
          height: size * 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg
          viewBox="0 0 80 96"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: size, height: size * 1.2, ...faceStyle }}
        >
          {/* Left ear */}
          <ellipse cx="11" cy="50" rx="4.5" ry="7"
            fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2"/>
          {/* Right ear */}
          <ellipse cx="69" cy="50" rx="4.5" ry="7"
            fill="currentColor" fillOpacity="0.05" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.2"/>
          {/* Head oval */}
          <ellipse cx="40" cy="50" rx="27" ry="37"
            fill="currentColor" fillOpacity="0.06" stroke="currentColor" strokeOpacity="0.88" strokeWidth="1.6"/>
          {/* Left brow */}
          <path d="M22 29 Q29 25 36 27" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Right brow */}
          <path d="M44 27 Q51 25 58 29" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.2" strokeLinecap="round"/>
          {/* Left eye */}
          <ellipse cx="29" cy="37" rx="6.5" ry="5.5"
            fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.65" strokeWidth="1"/>
          <ellipse cx="29" cy="37.5" rx="3.2" ry="3.5" fill="currentColor" fillOpacity="0.75"/>
          {/* Right eye */}
          <ellipse cx="51" cy="37" rx="6.5" ry="5.5"
            fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeOpacity="0.65" strokeWidth="1"/>
          <ellipse cx="51" cy="37.5" rx="3.2" ry="3.5" fill="currentColor" fillOpacity="0.75"/>
          {/* Nose */}
          <path d="M40 47 L35.5 60 Q40 64 44.5 60 Z"
            stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
          {/* Mouth */}
          <path d="M29 72 Q40 80 51 72"
            stroke="currentColor" strokeOpacity="0.48" strokeWidth="1.3" strokeLinecap="round" fill="none"/>
        </svg>
      </div>
    </>
  );
}
