import Roact from "@rbxts/roact";
import { hooked, useBinding, useState } from "@rbxts/roact-hooked";
import ActionButton from "components/ActionButton";
import Border from "components/Border";
import BrightSlider from "components/BrightSlider";
import Canvas from "components/Canvas";
import Card from "components/Card";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useSpring } from "hooks/common/use-spring";
import { useTheme } from "hooks/use-theme";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { setJobValue } from "store/actions/jobs.action";
import { DashboardPage } from "store/models/dashboard.model";
import { px, scale } from "utils/udim2";

const DEFAULT_CAMERA_FOV = 70;

/** Same height as `Players` card (`Players.tsx`). */
const CARD_H = 648;
const CARD_SIZE = px(326, CARD_H);
const CARD_PAD = 24;
/** Extra inset so ESP toggle row is not flush with the card bottom. */
const ESP_BLOCK_BOTTOM_PAD = 40;

const SLIDER_H = 49;
const SLIDER_STEP = 69;

const SECTION_HEADING_TEXT = 17;
const SECTION_HEADING_H = 22;

const GAP_BEFORE_DIVIDER = 28;

/** Master ESP toggle — larger tap target */
const ENABLE_BTN_W = 120;
const ENABLE_BTN_H = 40;
const ESP_HEADER_ROW_H = ENABLE_BTN_H;

const PREVIEW_H = 100;
const GAP_AFTER_PREVIEW = 20;
const GAP_BEFORE_TOGGLES = 28;
const GAP_AFTER_ESP_HEADER = 12;

function hueToColor(hue: number): Color3 {
	return Color3.fromHSV(hue / 360, 1, 1);
}

/** Bottom padding inside card (matches `CARD_PAD`). */
function espBlockHeight(): number {
	const bodyAfterPreview = SLIDER_H + SLIDER_STEP + SLIDER_STEP + GAP_BEFORE_TOGGLES + SLIDER_H;
	return ESP_HEADER_ROW_H + GAP_AFTER_ESP_HEADER + PREVIEW_H + GAP_AFTER_PREVIEW + bodyAfterPreview;
}

function Esp() {
	const dispatch = useAppDispatch();
	const theme = useTheme("apps").players;
	const profileHighlight = useTheme("home").profile.highlight;
	const fillJob = useAppSelector((state) => state.jobs.espFill);
	const outlineJob = useAppSelector((state) => state.jobs.espOutline);
	const hueJob = useAppSelector((state) => state.jobs.espHue);
	const cameraFovJob = useAppSelector((state) => state.jobs.cameraFov);

	const espActive = useAppSelector((state) => state.jobs.esp.active);
	const espNameActive = useAppSelector((state) => state.jobs.espName.active);
	const espHealthActive = useAppSelector((state) => state.jobs.espHealth.active);
	const espTracersActive = useAppSelector((state) => state.jobs.espTracers.active);

	const subActiveCount = [espActive, espNameActive, espHealthActive, espTracersActive].filter((v) => v).size();

	const [fillValue, setFillValue] = useBinding(fillJob.value);
	const [outlineValue, setOutlineValue] = useBinding(outlineJob.value);
	const [hueValue, setHueValue] = useBinding(hueJob.value);
	const [hueColor, setHueColor] = useState(hueToColor(hueJob.value));

	const [fovValue, setFovValue] = useBinding(cameraFovJob.value);
	const [fovSliderKey, setFovSliderKey] = useState(0);
	const [resetHover, setResetHover] = useState(false);

	const fillAccent = profileHighlight.flight;
	const outlineAccent = profileHighlight.walkSpeed;
	const hueAccent = profileHighlight.jumpHeight;
	const fovAccent = theme.highlight.teleport;

	const resetFill = useSpring(
		resetHover
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(fovAccent, 0.1)
			: theme.button.background,
		{},
	);
	const resetTextTransparency = useSpring(
		resetHover ? theme.button.foregroundTransparency - 0.25 : theme.button.foregroundTransparency,
		{},
	);

	/* ── Top: Camera (FOV) ───────────────────────────────────────── */
	const yCameraTitle = 52;
	const yCameraSubtitle = yCameraTitle + SECTION_HEADING_H + 4;
	const yFovRow = yCameraSubtitle + 16 + 8;
	const yDivider = yFovRow + SLIDER_H + GAP_BEFORE_DIVIDER;

	const espH = espBlockHeight();

	/* ── Bottom ESP block (relative Y inside anchored canvas) ──── */
	let y = 0;
	const yEspHeader = y;
	y += ESP_HEADER_ROW_H + GAP_AFTER_ESP_HEADER;
	const yPreview = y;
	y += PREVIEW_H + GAP_AFTER_PREVIEW;
	const yFill = y;
	y += SLIDER_STEP;
	const yOutline = y;
	y += SLIDER_STEP;
	const yHue = y;
	y += SLIDER_STEP + GAP_BEFORE_TOGGLES;
	const yToggles = y;

	return (
		<Card index={2} page={DashboardPage.Apps} theme={theme} size={CARD_SIZE} position={new UDim2(0, 374, 1, 0)}>
			<textlabel
				Text="Visuals"
				Font="GothamBlack"
				TextSize={20}
				TextColor3={theme.foreground}
				TextXAlignment="Left"
				TextYAlignment="Top"
				Position={px(CARD_PAD, CARD_PAD)}
				BackgroundTransparency={1}
				Event={{
					MouseEnter: () =>
						dispatch(
							setHint(
								"<font face='GothamBlack'>Visuals</font> — camera field of view and player ESP options",
							),
						),
					MouseLeave: () => dispatch(clearHint()),
				}}
			/>

			<textlabel
				Text="Camera"
				Font="GothamBlack"
				TextSize={SECTION_HEADING_TEXT}
				TextColor3={theme.foreground}
				TextTransparency={0.25}
				TextXAlignment="Left"
				TextYAlignment="Top"
				Position={px(CARD_PAD, yCameraTitle)}
				Size={new UDim2(1, -48, 0, SECTION_HEADING_H)}
				BackgroundTransparency={1}
				Event={{
					MouseEnter: () =>
						dispatch(
							setHint(
								"<font face='GothamBlack'>Camera</font> — settings for your view (not related to ESP overlays)",
							),
						),
					MouseLeave: () => dispatch(clearHint()),
				}}
			/>

			<textlabel
				Text="Field of view (FOV)"
				Font="GothamBold"
				TextSize={13}
				TextColor3={theme.foreground}
				TextTransparency={0.45}
				TextXAlignment="Left"
				TextYAlignment="Top"
				Position={px(CARD_PAD, yCameraSubtitle)}
				Size={new UDim2(1, -48, 0, 16)}
				BackgroundTransparency={1}
				Event={{
					MouseEnter: () =>
						dispatch(
							setHint(
								"<font face='GothamBlack'>Field of view (FOV)</font> — horizontal camera angle in degrees. Wider = see more at once.",
							),
						),
					MouseLeave: () => dispatch(clearHint()),
				}}
			/>

			<frame
				Size={px(278, SLIDER_H)}
				Position={px(CARD_PAD, yFovRow)}
				BackgroundTransparency={1}
				Event={{
					MouseEnter: () =>
						dispatch(
							setHint(
								"Drag to set <font face='GothamBlack'>camera FOV</font> (30°–120°). Release to apply.",
							),
						),
					MouseLeave: () => dispatch(clearHint()),
				}}
			>
				<BrightSlider
					Key={fovSliderKey}
					min={30}
					max={120}
					initialValue={cameraFovJob.value}
					onValueChanged={setFovValue}
					onRelease={(v) => dispatch(setJobValue("cameraFov", math.round(v)))}
					size={px(193, SLIDER_H)}
					position={px(0, 0)}
					radius={8}
					color={theme.button.background}
					accentColor={fovAccent}
					borderEnabled={theme.button.outlined}
					borderColor={theme.button.foreground}
					transparency={theme.button.backgroundTransparency}
				>
					<textlabel
						Font="GothamBold"
						Text={fovValue.map((v) => `${math.round(v)}`)}
						TextSize={15}
						TextColor3={theme.button.foreground}
						TextTransparency={theme.button.foregroundTransparency}
						TextXAlignment="Center"
						TextYAlignment="Center"
						Size={scale(1, 1)}
						BackgroundTransparency={1}
					/>
				</BrightSlider>

				<Canvas size={px(73, SLIDER_H)} position={px(205, 0)}>
					<Fill color={resetFill} radius={8} transparency={theme.button.backgroundTransparency} />
					{theme.button.outlined && <Border color={theme.button.foreground} radius={8} transparency={0.8} />}
					<textlabel
						Text="Reset"
						Font="GothamBold"
						TextSize={14}
						TextColor3={theme.button.foreground}
						TextTransparency={resetTextTransparency}
						TextXAlignment="Center"
						TextYAlignment="Center"
						Size={scale(1, 1)}
						BackgroundTransparency={1}
					/>
					<textbutton
						Text=""
						AutoButtonColor={false}
						Size={scale(1, 1)}
						BackgroundTransparency={1}
						Event={{
							MouseEnter: () => {
								setResetHover(true);
								dispatch(
									setHint("Reset <font face='GothamBlack'>field of view</font> to default (70°)"),
								);
							},
							MouseLeave: () => {
								setResetHover(false);
								dispatch(clearHint());
							},
							Activated: () => {
								dispatch(setJobValue("cameraFov", DEFAULT_CAMERA_FOV));
								setFovValue(DEFAULT_CAMERA_FOV);
								setFovSliderKey((k) => k + 1);
							},
						}}
					/>
				</Canvas>
			</frame>

			<frame
				Size={new UDim2(1, -CARD_PAD * 2, 0, 1)}
				Position={px(CARD_PAD, yDivider)}
				BackgroundColor3={theme.foreground}
				BackgroundTransparency={0.75}
				BorderSizePixel={0}
			/>

			{/* ESP — anchored to bottom of card */}
			<Canvas
				anchor={new Vector2(0, 1)}
				position={new UDim2(0, CARD_PAD, 1, -ESP_BLOCK_BOTTOM_PAD)}
				size={px(278, espH)}
			>
				{/* Header: ESP + Enable */}
				<Canvas size={px(278, ESP_HEADER_ROW_H)} position={px(0, yEspHeader)}>
					<textlabel
						Text="ESP"
						Font="GothamBlack"
						TextSize={SECTION_HEADING_TEXT}
						TextColor3={theme.foreground}
						TextTransparency={0.25}
						TextXAlignment="Left"
						TextYAlignment="Center"
						Position={px(0, 0)}
						Size={new UDim2(1, -(ENABLE_BTN_W + 8), 1, 0)}
						BackgroundTransparency={1}
						Event={{
							MouseEnter: () =>
								dispatch(
									setHint(
										"<font face='GothamBlack'>ESP</font> — overlays on other players (highlights, names, health, tracers). Use <b>Enable</b> to turn the whole feature on or off.",
									),
								),
							MouseLeave: () => dispatch(clearHint()),
						}}
					/>
					<ActionButton
						action="espEnabled"
						hint="<font face='GothamBlack'>Enable ESP</font> — master switch for highlights, names, health bars, and tracers (not camera FOV)"
						theme={theme}
						label="Enable"
						position={px(278 - ENABLE_BTN_W, 0)}
						size={px(ENABLE_BTN_W, ENABLE_BTN_H)}
						canDeactivate
					/>
				</Canvas>

				<frame
					Size={px(278, PREVIEW_H)}
					Position={px(0, yPreview)}
					BackgroundTransparency={1}
					Event={{
						MouseEnter: () =>
							dispatch(
								setHint(
									"Live preview of <font face='GothamBlack'>ESP highlight</font> fill, outline, and hue",
								),
							),
						MouseLeave: () => dispatch(clearHint()),
					}}
				>
					<Canvas size={px(278, PREVIEW_H)} position={px(0, 0)}>
						<Fill
							color={theme.button.background}
							radius={16}
							transparency={theme.button.backgroundTransparency}
						/>
						{theme.button.outlined && (
							<Border color={theme.button.foreground} radius={16} transparency={0.8} />
						)}

						<Canvas size={px(80, 68)} position={px(99, 16)}>
							<Fill color={hueColor} radius={14} transparency={fillValue.map((v) => 1 - v / 100)} />
							<Border color={hueColor} radius={14} transparency={outlineValue.map((v) => 1 - v / 100)} />
							<textlabel
								Text="TARGET"
								Font="GothamBlack"
								TextSize={13}
								TextColor3={theme.foreground}
								Size={scale(1, 1)}
								BackgroundTransparency={1}
							/>
						</Canvas>
					</Canvas>
				</frame>

				<frame
					Size={px(278, SLIDER_H)}
					Position={px(0, yFill)}
					BackgroundTransparency={1}
					Event={{
						MouseEnter: () =>
							dispatch(
								setHint(
									"<font face='GothamBlack'>Fill</font> — opacity of the highlight fill over players (0–100%)",
								),
							),
						MouseLeave: () => dispatch(clearHint()),
					}}
				>
					<BrightSlider
						min={0}
						max={100}
						initialValue={fillJob.value}
						onValueChanged={setFillValue}
						onRelease={(v) => dispatch(setJobValue("espFill", math.round(v)))}
						size={px(193, SLIDER_H)}
						position={px(0, 0)}
						radius={8}
						color={theme.button.background}
						accentColor={fillAccent}
						borderEnabled={theme.button.outlined}
						borderColor={theme.button.foreground}
						transparency={theme.button.backgroundTransparency}
					>
						<textlabel
							Font="GothamBold"
							Text={fillValue.map((v) => `${math.round(v)}%`)}
							TextSize={15}
							TextColor3={theme.button.foreground}
							TextTransparency={theme.button.foregroundTransparency}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
					</BrightSlider>

					<Canvas size={px(73, SLIDER_H)} position={px(205, 0)}>
						<Fill
							color={theme.button.background}
							radius={8}
							transparency={theme.button.backgroundTransparency}
						/>
						{theme.button.outlined && (
							<Border color={theme.button.foreground} radius={8} transparency={0.8} />
						)}
						<textlabel
							Text="Fill"
							Font="GothamBold"
							TextSize={15}
							TextColor3={theme.button.foreground}
							TextTransparency={theme.button.foregroundTransparency}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
					</Canvas>
				</frame>

				<frame
					Size={px(278, SLIDER_H)}
					Position={px(0, yOutline)}
					BackgroundTransparency={1}
					Event={{
						MouseEnter: () =>
							dispatch(
								setHint(
									"<font face='GothamBlack'>Outline</font> — opacity of the highlight outline (0–100%)",
								),
							),
						MouseLeave: () => dispatch(clearHint()),
					}}
				>
					<BrightSlider
						min={0}
						max={100}
						initialValue={outlineJob.value}
						onValueChanged={setOutlineValue}
						onRelease={(v) => dispatch(setJobValue("espOutline", math.round(v)))}
						size={px(193, SLIDER_H)}
						position={px(0, 0)}
						radius={8}
						color={theme.button.background}
						accentColor={outlineAccent}
						borderEnabled={theme.button.outlined}
						borderColor={theme.button.foreground}
						transparency={theme.button.backgroundTransparency}
					>
						<textlabel
							Font="GothamBold"
							Text={outlineValue.map((v) => `${math.round(v)}%`)}
							TextSize={15}
							TextColor3={theme.button.foreground}
							TextTransparency={theme.button.foregroundTransparency}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
					</BrightSlider>

					<Canvas size={px(73, SLIDER_H)} position={px(205, 0)}>
						<Fill
							color={theme.button.background}
							radius={8}
							transparency={theme.button.backgroundTransparency}
						/>
						{theme.button.outlined && (
							<Border color={theme.button.foreground} radius={8} transparency={0.8} />
						)}
						<textlabel
							Text="Outline"
							Font="GothamBold"
							TextSize={15}
							TextColor3={theme.button.foreground}
							TextTransparency={theme.button.foregroundTransparency}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
					</Canvas>
				</frame>

				<frame
					Size={px(278, SLIDER_H)}
					Position={px(0, yHue)}
					BackgroundTransparency={1}
					Event={{
						MouseEnter: () =>
							dispatch(
								setHint(
									"<font face='GothamBlack'>Hue</font> — highlight color on the color wheel (0°–360°)",
								),
							),
						MouseLeave: () => dispatch(clearHint()),
					}}
				>
					<BrightSlider
						min={0}
						max={360}
						initialValue={hueJob.value}
						onValueChanged={(v) => {
							setHueValue(v);
							setHueColor(hueToColor(v));
						}}
						onRelease={(v) => dispatch(setJobValue("espHue", math.round(v)))}
						size={px(193, SLIDER_H)}
						position={px(0, 0)}
						radius={8}
						color={theme.button.background}
						accentColor={hueAccent}
						borderEnabled={theme.button.outlined}
						borderColor={theme.button.foreground}
						transparency={theme.button.backgroundTransparency}
					>
						<textlabel
							Font="GothamBold"
							Text={hueValue.map((v) => `${math.round(v)}°`)}
							TextSize={15}
							TextColor3={theme.button.foreground}
							TextTransparency={theme.button.foregroundTransparency}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
					</BrightSlider>

					<Canvas size={px(73, SLIDER_H)} position={px(205, 0)}>
						<Fill
							color={theme.button.background}
							radius={8}
							transparency={theme.button.backgroundTransparency}
						/>
						{theme.button.outlined && (
							<Border color={theme.button.foreground} radius={8} transparency={0.8} />
						)}
						<textlabel
							Text="Hue"
							Font="GothamBold"
							TextSize={15}
							TextColor3={theme.button.foreground}
							TextTransparency={theme.button.foregroundTransparency}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
					</Canvas>
				</frame>

				<Canvas size={px(278, SLIDER_H)} position={px(0, yToggles)}>
					<ActionButton
						action="esp"
						hint="<font face='GothamBlack'>Highlight</font> — colored outline/fill on other players’ characters"
						theme={theme}
						label="Highlight"
						position={px(0, 0)}
						size={px(62, SLIDER_H)}
						canDeactivate={subActiveCount > 1}
					/>
					<ActionButton
						action="espName"
						hint="<font face='GothamBlack'>Names</font> — display name tags above players"
						theme={theme}
						label="Names"
						position={px(72, 0)}
						size={px(62, SLIDER_H)}
						canDeactivate={subActiveCount > 1}
					/>
					<ActionButton
						action="espHealth"
						hint="<font face='GothamBlack'>Health</font> — health bars above players"
						theme={theme}
						label="Health"
						position={px(144, 0)}
						size={px(62, SLIDER_H)}
						canDeactivate={subActiveCount > 1}
					/>
					<ActionButton
						action="espTracers"
						hint="<font face='GothamBlack'>Tracers</font> — lines from the screen toward each player"
						theme={theme}
						label="Tracers"
						position={px(216, 0)}
						size={px(62, SLIDER_H)}
						canDeactivate={subActiveCount > 1}
					/>
				</Canvas>
			</Canvas>
		</Card>
	);
}

export default hooked(Esp);
