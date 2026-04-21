import { SLIDER_H } from "./visuals.constants";

/** Master ESP toggle — larger tap target */
export const ENABLE_BTN_W = 120;
export const ENABLE_BTN_H = 40;
export const ESP_HEADER_ROW_H = ENABLE_BTN_H;

/** Taller preview shrinks the FOV↔ESP middle gap (divider padding). */
export const PREVIEW_H = 104;
/** Uniform vertical gap: Enable row ↔ preview ↔ each slider row ↔ bottom toggles. */
export const ESP_SECTION_GAP = 16;
export const SLIDER_STEP = SLIDER_H + ESP_SECTION_GAP;

export function hueToColor(hue: number): Color3 {
	return Color3.fromHSV(hue / 360, 1, 1);
}

/** Total height of the ESP stack (bottom-anchored; must leave room below FOV + divider). */
export function espBlockHeight(): number {
	return ESP_HEADER_ROW_H + ESP_SECTION_GAP + PREVIEW_H + ESP_SECTION_GAP + 4 * SLIDER_H + 3 * ESP_SECTION_GAP;
}

export function getEspInternalLayout() {
	let y = 0;
	const yEspHeader = y;
	y += ESP_HEADER_ROW_H + ESP_SECTION_GAP;
	const yPreview = y;
	y += PREVIEW_H + ESP_SECTION_GAP;
	const yFill = y;
	y += SLIDER_STEP;
	const yOutline = y;
	y += SLIDER_STEP;
	const yHue = y;
	y += SLIDER_STEP;
	const yToggles = y;
	return { yEspHeader, yPreview, yFill, yOutline, yHue, yToggles };
}
