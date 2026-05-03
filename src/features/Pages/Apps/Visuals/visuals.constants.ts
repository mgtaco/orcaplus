import { px } from "utils/udim2";

/** Same height as `Players` card (`Players.tsx`). */
export const CARD_H = 648;
export const CARD_SIZE = px(326, CARD_H);
export const CARD_PAD = 24;

export const SLIDER_H = 49;

export const SECTION_HEADING_TEXT = 17;
export const SECTION_HEADING_H = 22;

export const DIVIDER_H = 1;

export const DEFAULT_CAMERA_FOV = 70;

export function getCameraLayout() {
	const yCameraTitle = 52;
	const yCameraSubtitle = yCameraTitle + SECTION_HEADING_H + 4;
	/* Slightly lower FOV row — also tightens space around the divider vs ESP. */
	const yFovRow = yCameraSubtitle + 20 + 12;
	const bottomFovY = yFovRow + SLIDER_H;
	return { yCameraTitle, yCameraSubtitle, yFovRow, bottomFovY };
}
