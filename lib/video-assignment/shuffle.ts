/** Fisher-Yates shuffle; does not mutate the input. */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Assigns one "video group" (e.g. "video3") to each screen for the current
 * configuration, such that no group is used by two screens at once.
 *
 * Each screen owns its own encode of every group (Screen_1/video3.mp4 and
 * Screen_2/video3.mp4 are different files showing the same content, cropped
 * for that screen's aspect ratio) — so satisfying "no repeats" only requires
 * a random bijection from screens to group ids, which is exact whenever
 * every screen shares the same pool size (the expected, supported case).
 * If pool sizes differ, we fall back to cycling the shuffled list per
 * screen, which can no longer guarantee zero repeats — logged as a warning
 * so the mismatch gets noticed instead of silently tolerated.
 */
export function assignVideoGroups(screenIds: string[], groupIds: string[]): Record<string, string> {
  if (groupIds.length < screenIds.length) {
    console.warn(
      `assignVideoGroups: only ${groupIds.length} video groups available for ${screenIds.length} screens; some groups will repeat.`,
    );
  }

  const shuffled = shuffleArray(groupIds);
  const assignment: Record<string, string> = {};
  screenIds.forEach((screenId, index) => {
    assignment[screenId] = shuffled[index % shuffled.length];
  });
  return assignment;
}
