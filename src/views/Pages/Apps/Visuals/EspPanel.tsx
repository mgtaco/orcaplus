import Roact from "@rbxts/roact";
import { hooked, useBinding, useState } from "@rbxts/roact-hooked";
import ActionButton from "components/ActionButton";
import Border from "components/Border";
import BrightSlider from "components/BrightSlider";
import Canvas from "components/Canvas";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useTheme } from "hooks/use-theme";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { setJobValue } from "store/actions/jobs.action";
import { Theme } from "themes/theme.interface";
import { px, scale } from "utils/udim2";

import {
	ENABLE_BTN_H,
	ENABLE_BTN_W,
	ESP_HEADER_ROW_H,
	PREVIEW_H,
	espBlockHeight,
	getEspInternalLayout,
	hueToColor,
} from "./esp-layout";
import { SECTION_HEADING_TEXT, SLIDER_H } from "./visuals.constants";

interface Props {
	theme: Theme["apps"]["players"];
}

function EspPanel({ theme }: Props) {
	const dispatch = useAppDispatch();
	const profileHighlight = useTheme("home").profile.highlight;
	const fillJob = useAppSelector((state) => state.jobs.espFill);
	const outlineJob = useAppSelector((state) => state.jobs.espOutline);
	const hueJob = useAppSelector((state) => state.jobs.espHue);

	const espActive = useAppSelector((state) => state.jobs.esp.active);
	const espNameActive = useAppSelector((state) => state.jobs.espName.active);
	const espHealthActive = useAppSelector((state) => state.jobs.espHealth.active);
	const espTracersActive = useAppSelector((state) => state.jobs.espTracers.active);

	const subActiveCount = [espActive, espNameActive, espHealthActive, espTracersActive].filter((v) => v).size();

	const [fillValue, setFillValue] = useBinding(fillJob.value);
	const [outlineValue, setOutlineValue] = useBinding(outlineJob.value);
	const [hueValue, setHueValue] = useBinding(hueJob.value);
	const [hueColor, setHueColor] = useState(hueToColor(hueJob.value));

	const fillAccent = profileHighlight.flight;
	const outlineAccent = profileHighlight.walkSpeed;
	const hueAccent = profileHighlight.jumpHeight;

	const { yEspHeader, yPreview, yFill, yOutline, yHue, yToggles } = getEspInternalLayout();
	const espH = espBlockHeight();

	return (
		<Canvas size={px(278, espH)} position={px(0, 0)}>
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
					{theme.button.outlined && <Border color={theme.button.foreground} radius={16} transparency={0.8} />}

					<Canvas size={px(80, 68)} position={px(99, math.floor((PREVIEW_H - 68) / 2))}>
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
					{theme.button.outlined && <Border color={theme.button.foreground} radius={8} transparency={0.8} />}
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
					{theme.button.outlined && <Border color={theme.button.foreground} radius={8} transparency={0.8} />}
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
					{theme.button.outlined && <Border color={theme.button.foreground} radius={8} transparency={0.8} />}
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
	);
}

export default hooked(EspPanel);
