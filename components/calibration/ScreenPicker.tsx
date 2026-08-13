"use client";

import type { ScreenConfig } from "@/lib/geometry/types";

interface ScreenPickerProps {
  screens: ScreenConfig[];
  activeScreenId: string;
  confirmed: Record<string, boolean>;
  onSelect: (screenId: string) => void;
  onToggleConfirm: (screenId: string) => void;
  onToggleVisible: (screenId: string) => void;
}

export function ScreenPicker({
  screens,
  activeScreenId,
  confirmed,
  onSelect,
  onToggleConfirm,
  onToggleVisible,
}: ScreenPickerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {screens.map((screen) => (
        <div key={screen.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={() => onSelect(screen.id)}
            style={{
              flex: 1,
              textAlign: "left",
              padding: "6px 10px",
              background: screen.id === activeScreenId ? "#22c55e" : "#1a1a1a",
              color: screen.id === activeScreenId ? "#000" : "#fff",
              opacity: screen.visible ? 1 : 0.4,
              border: "1px solid #333",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            {screen.label}
          </button>
          <label style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={screen.visible} onChange={() => onToggleVisible(screen.id)} />
            visible
          </label>
          <label style={{ fontSize: 11, color: "#aaa", display: "flex", alignItems: "center", gap: 4 }}>
            <input type="checkbox" checked={!!confirmed[screen.id]} onChange={() => onToggleConfirm(screen.id)} />
            OK
          </label>
        </div>
      ))}
    </div>
  );
}
