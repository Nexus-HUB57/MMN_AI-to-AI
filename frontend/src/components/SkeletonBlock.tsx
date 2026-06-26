// D12 SKELETON_BLOCK
import React from "react";
export default function SkeletonBlock({
  h = 14, w = "100%", rounded = 8, className = "",
}: { h?: number; w?: number | string; rounded?: number; className?: string }) {
  return (
    <div
      className={"ux-skeleton " + className}
      style={{ height: h, width: typeof w === "number" ? `${w}px` : w, borderRadius: rounded }}
    />
  );
}
