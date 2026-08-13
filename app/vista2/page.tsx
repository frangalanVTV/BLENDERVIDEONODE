import { readScreens } from "@/lib/config/screens.server";
import { getVideoPools } from "@/lib/video-assignment/getVideoPools.server";
import { Viewer } from "@/components/viewer/Viewer";

export default function Vista2Page() {
  const screens = readScreens("screens2");
  const videoPools = getVideoPools(screens);
  return <Viewer renderSrc="/render2.png" frontSrc="/frente2.png" nextHref="/" screens={screens} videoPools={videoPools} />;
}
