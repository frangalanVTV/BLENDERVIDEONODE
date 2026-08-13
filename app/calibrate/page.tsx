import { readScreens } from "@/lib/config/screens.server";
import { getVideoPools } from "@/lib/video-assignment/getVideoPools.server";
import { CalibrationEditor } from "@/components/calibration/CalibrationEditor";

export default function CalibratePage() {
  const screens = readScreens("screens");
  const videoPools = getVideoPools(screens);
  return (
    <CalibrationEditor
      renderSrc="/render.png"
      frontSrc="/frente.png"
      dataFile="screens"
      viewLabel="Vista 1"
      initialScreens={screens}
      videoPools={videoPools}
    />
  );
}
