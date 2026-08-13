import { readScreens } from "@/lib/config/screens.server";
import { getVideoPools } from "@/lib/video-assignment/getVideoPools.server";
import { CalibrationEditor } from "@/components/calibration/CalibrationEditor";

export default function CalibratePage() {
  const screens = readScreens();
  const videoPools = getVideoPools(screens);
  return <CalibrationEditor initialScreens={screens} videoPools={videoPools} />;
}
