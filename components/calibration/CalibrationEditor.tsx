"use client";

import { useCallback, useMemo, useState } from "react";
import type { NormalizedPoint, ScreenConfig, ScreensConfig } from "@/lib/geometry/types";
import type { VideoPool } from "@/lib/video-assignment/getVideoPools.server";
import { RenderStage } from "../render-viewer/RenderStage";
import { CalibrationOverlay } from "./CalibrationOverlay";
import { ScreenPicker } from "./ScreenPicker";

interface CalibrationEditorProps {
  renderSrc: string;
  frontSrc: string;
  /** e.g. "screens" or "screens2" — matches the data/<dataFile>.json this view calibrates and /api/screens/<dataFile>. */
  dataFile: string;
  viewLabel: string;
  initialScreens: ScreensConfig;
  videoPools: VideoPool[];
}

type SaveState = "idle" | "saving" | "saved" | "error";

/**
 * Calibration mode for one view: drag each screen's 4 corners over that
 * view's render until the live video preview matches the physical screen,
 * tick "OK" to hide that screen's handles, then "Guardar" to persist all
 * corners to data/<dataFile>.json.
 *
 * Persistence writes to the local filesystem via /api/screens/<dataFile>,
 * which only works when running `npm run dev` on your machine (Vercel's
 * serverless filesystem is read-only) — calibrate locally, commit the
 * resulting JSON, then deploy.
 */
export function CalibrationEditor({ renderSrc, frontSrc, dataFile, viewLabel, initialScreens, videoPools }: CalibrationEditorProps) {
  const [screens, setScreens] = useState(initialScreens);
  const [activeScreenId, setActiveScreenId] = useState(initialScreens[0]?.id ?? "");
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const poolByScreen = useMemo(() => new Map(videoPools.map((pool) => [pool.screenId, pool.groupIds])), [videoPools]);

  const getPreviewSrc = useCallback(
    (screen: ScreenConfig) => {
      const groupIds = poolByScreen.get(screen.id) ?? [];
      return groupIds.length > 0 ? `/videos/${screen.folder}/${groupIds[0]}.mp4` : undefined;
    },
    [poolByScreen],
  );

  const updateCorner = useCallback((screenId: string, index: number, point: NormalizedPoint) => {
    setScreens((prev) =>
      prev.map((screen) => {
        if (screen.id !== screenId) return screen;
        const corners = [...screen.corners] as ScreenConfig["corners"];
        corners[index] = point;
        return { ...screen, corners };
      }),
    );
  }, []);

  const translateScreen = useCallback((screenId: string, deltaX: number, deltaY: number) => {
    setScreens((prev) =>
      prev.map((screen) => {
        if (screen.id !== screenId) return screen;
        const corners = screen.corners.map((corner) => ({
          x: corner.x + deltaX,
          y: corner.y + deltaY,
        })) as ScreenConfig["corners"];
        return { ...screen, corners };
      }),
    );
  }, []);

  const toggleConfirm = useCallback((screenId: string) => {
    setConfirmed((prev) => ({ ...prev, [screenId]: !prev[screenId] }));
  }, []);

  const toggleVisible = useCallback((screenId: string) => {
    setScreens((prev) => prev.map((screen) => (screen.id === screenId ? { ...screen, visible: !screen.visible } : screen)));
  }, []);

  const save = useCallback(async () => {
    setSaveState("saving");
    try {
      const res = await fetch(`/api/screens/${dataFile}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(screens),
      });
      setSaveState(res.ok ? "saved" : "error");
    } catch {
      setSaveState("error");
    }
  }, [screens, dataFile]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000", display: "flex" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <RenderStage renderSrc={renderSrc} frontSrc={frontSrc} frontLayerZIndex={0}>
          {(width, height) => (
            <>
              {screens.filter((screen) => screen.visible).map((screen) => (
                <CalibrationOverlay
                  key={screen.id}
                  screen={screen}
                  containerWidth={width}
                  containerHeight={height}
                  videoSrc={getPreviewSrc(screen)}
                  isActive={screen.id === activeScreenId}
                  showHandles={!confirmed[screen.id]}
                  onChangeCorner={(index, point) => updateCorner(screen.id, index, point)}
                  onTranslate={(dx, dy) => translateScreen(screen.id, dx, dy)}
                />
              ))}
            </>
          )}
        </RenderStage>
      </div>

      <div style={{ width: 280, padding: 16, background: "#0a0a0a", color: "#fff", borderLeft: "1px solid #222", overflowY: "auto" }}>
        <h1 style={{ fontSize: 14, marginBottom: 4 }}>Calibración — {viewLabel}</h1>
        <p style={{ fontSize: 11, color: "#888", marginBottom: 12, lineHeight: 1.4 }}>
          Arrastrá el video para moverlo entero, o un punto verde para ajustar solo esa esquina.
        </p>
        <ScreenPicker
          screens={screens}
          activeScreenId={activeScreenId}
          confirmed={confirmed}
          onSelect={setActiveScreenId}
          onToggleConfirm={toggleConfirm}
          onToggleVisible={toggleVisible}
        />
        <button
          onClick={save}
          disabled={saveState === "saving"}
          style={{
            marginTop: 16,
            width: "100%",
            padding: "8px 0",
            background: "#22c55e",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          {saveState === "saving" ? "Guardando..." : "Guardar calibración"}
        </button>
        {saveState === "saved" && <p style={{ fontSize: 12, color: "#22c55e", marginTop: 8 }}>Guardado en data/{dataFile}.json</p>}
        {saveState === "error" && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>Error al guardar</p>}
      </div>
    </div>
  );
}
