import Roact from "@rbxts/roact";
import { hooked, useBinding, useState } from "@rbxts/roact-hooked";
import ActionButton from "components/ActionButton";
import Border from "components/Border";
import BrightSlider from "components/BrightSlider";
import Canvas from "components/Canvas";
import Card from "components/Card";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useTheme } from "hooks/use-theme";
import { setJobValue } from "store/actions/jobs.action";
import { DashboardPage } from "store/models/dashboard.model";
import { px, scale } from "utils/udim2";

function hueToColor(hue: number): Color3 {
	return Color3.fromHSV(hue / 360, 1, 1);
}

function Esp() {
	const dispatch = useAppDispatch();
	const theme = useTheme("apps").players;
	const profileHighlight = useTheme("home").profile.highlight;
	const fillJob = useAppSelector((state) => state.jobs.espFill);
	const outlineJob = useAppSelector((state) => state.jobs.espOutline);
	const hueJob = useAppSelector((state) => state.jobs.espHue);

	// Sub-toggle active states — used to enforce the "at least 1 active" rule
	const espActive = useAppSelector((state) => state.jobs.esp.active);
	const espNameActive = useAppSelector((state) => state.jobs.espName.active);
	const espHealthActive = useAppSelector((state) => state.jobs.espHealth.active);
	const espTracersActive = useAppSelector((state) => state.jobs.espTracers.active);

	// Number of sub-toggles currently on. When only 1 remains, that button cannot be deactivated.
	const subActiveCount = [espActive, espNameActive, espHealthActive, espTracersActive].filter((v) => v).size();

	const [fillValue, setFillValue] = useBinding(fillJob.value);
	const [outlineValue, setOutlineValue] = useBinding(outlineJob.value);
	const [hueValue, setHueValue] = useBinding(hueJob.value);
	const [hueColor, setHueColor] = useState(hueToColor(hueJob.value));

	const fillAccent = profileHighlight.flight;
	const outlineAccent = profileHighlight.walkSpeed;
	const hueAccent = profileHighlight.jumpHeight;

	return (
		<Card index={2} page={DashboardPage.Apps} theme={theme} size={px(326, 437)} position={new UDim2(0, 374, 1, 0)}>
			{/* Heading */}
			<textlabel
				Text="Visuals"
				Font="GothamBlack"
				TextSize={20}
				TextColor3={theme.foreground}
				TextXAlignment="Left"
				TextYAlignment="Top"
				Position={px(24, 24)}
				BackgroundTransparency={1}
			/>

			{/* Enable ESP master toggle — top right of heading row */}
			<ActionButton
				action="espEnabled"
				hint="<font face='GothamBlack'>Enable ESP</font> — master toggle for all ESP features"
				theme={theme}
				label="Enable"
				position={new UDim2(1, -114, 0, 20)}
				size={px(90, 28)}
				canDeactivate
			/>

			{/* Live preview box */}
			<Canvas size={px(278, 100)} position={px(24, 60)}>
				<Fill color={theme.button.background} radius={16} transparency={theme.button.backgroundTransparency} />
				{theme.button.outlined && <Border color={theme.button.foreground} radius={16} transparency={0.8} />}

				{/* Target highlight mockup — updates live as sliders move */}
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

			{/* Fill opacity slider */}
			<Canvas size={px(278, 49)} position={px(24, 176)}>
				<BrightSlider
					min={0}
					max={100}
					initialValue={fillJob.value}
					onValueChanged={setFillValue}
					onRelease={(v) => dispatch(setJobValue("espFill", math.round(v)))}
					size={px(193, 49)}
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

				<Canvas size={px(73, 49)} position={px(205, 0)}>
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
			</Canvas>

			{/* Outline opacity slider */}
			<Canvas size={px(278, 49)} position={px(24, 237)}>
				<BrightSlider
					min={0}
					max={100}
					initialValue={outlineJob.value}
					onValueChanged={setOutlineValue}
					onRelease={(v) => dispatch(setJobValue("espOutline", math.round(v)))}
					size={px(193, 49)}
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

				<Canvas size={px(73, 49)} position={px(205, 0)}>
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
			</Canvas>

			{/* Hue slider */}
			<Canvas size={px(278, 49)} position={px(24, 298)}>
				<BrightSlider
					min={0}
					max={360}
					initialValue={hueJob.value}
					onValueChanged={(v) => {
						setHueValue(v);
						setHueColor(hueToColor(v));
					}}
					onRelease={(v) => dispatch(setJobValue("espHue", math.round(v)))}
					size={px(193, 49)}
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

				<Canvas size={px(73, 49)} position={px(205, 0)}>
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
			</Canvas>

			{/* Toggle buttons — Highlight / Names / Health / Tracers (4 × 62px with 10px gaps) */}
			<Canvas size={px(278, 49)} position={px(24, 363)}>
				<ActionButton
					action="esp"
					hint="<font face='GothamBlack'>Highlight</font> other players with ESP outlines"
					theme={theme}
					label="Highlight"
					position={px(0, 0)}
					size={px(62, 49)}
					canDeactivate={subActiveCount > 1}
				/>
				<ActionButton
					action="espName"
					hint="Show <font face='GothamBlack'>name tags</font> above other players"
					theme={theme}
					label="Names"
					position={px(72, 0)}
					size={px(62, 49)}
					canDeactivate={subActiveCount > 1}
				/>
				<ActionButton
					action="espHealth"
					hint="Show <font face='GothamBlack'>health bars</font> above other players"
					theme={theme}
					label="Health"
					position={px(144, 0)}
					size={px(62, 49)}
					canDeactivate={subActiveCount > 1}
				/>
				<ActionButton
					action="espTracers"
					hint="Draw <font face='GothamBlack'>tracers</font> from screen edge to each player"
					theme={theme}
					label="Tracers"
					position={px(216, 0)}
					size={px(62, 49)}
					canDeactivate={subActiveCount > 1}
				/>
			</Canvas>
		</Card>
	);
}

export default hooked(Esp);
