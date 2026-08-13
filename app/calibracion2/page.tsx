import { readScreens } from "@/lib/config/screens.server";
import { getVideoPools } from "@/lib/video-assignment/getVideoPools.server";
import { CalibrationEditor } from "@/components/calibration/CalibrationEditor";

export default function Calibracion2Page() {
  const screens = readScreens("screens2");
  const videoPools = getVideoPools(screens);
  return (
    <CalibrationEditor
      renderSrc="/render2.png"
      frontSrc="/frente2.png"
      dataFile="screens2"
      viewLabel="Vista 2"
      initialScreens={screens}
      videoPools={videoPools}
    />
  );
}
