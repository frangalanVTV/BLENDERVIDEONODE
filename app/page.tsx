import { readScreens } from "@/lib/config/screens.server";
import { getVideoPools } from "@/lib/video-assignment/getVideoPools.server";
import { Viewer } from "@/components/viewer/Viewer";

export default function HomePage() {
  const screens = readScreens("screens");
  const videoPools = getVideoPools(screens);
  return (
    <Viewer renderSrc="/render.png" frontSrc="/frente.png" nextHref="/vista2" screens={screens} videoPools={videoPools} />
  );
}
