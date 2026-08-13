import { readScreens } from "@/lib/config/screens.server";
import { getVideoPools } from "@/lib/video-assignment/getVideoPools.server";
import { Viewer } from "@/components/viewer/Viewer";

export default function HomePage() {
  const screens = readScreens();
  const videoPools = getVideoPools(screens);
  return <Viewer screens={screens} videoPools={videoPools} />;
}
