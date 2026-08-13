"use client";

interface ShuffleButtonProps {
  onClick: () => void;
}

/** Clickable shuffle.png, pinned bottom-right on desktop and bottom-center on phone widths (see .shuffle-button in globals.css). */
export function ShuffleButton({ onClick }: ShuffleButtonProps) {
  return (
    <button
      onClick={onClick}
      className="shuffle-button"
      aria-label="Cambiar videos"
      style={{
        zIndex: 1000,
        width: 200,
        height: 200,
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static public asset, no benefit from next/image here */}
      <img src="/shuffle.png" alt="Cambiar videos" style={{ width: "100%", height: "100%", display: "block" }} draggable={false} />
    </button>
  );
}
