import Roact from "@rbxts/roact";
import { hooked, useBinding, useState } from "@rbxts/roact-hooked";
import Border from "components/Border";
import BrightButton from "components/BrightButton";
import BrightSlider from "components/BrightSlider";
import Canvas from "components/Canvas";
import Card from "components/Card";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useSpring } from "hooks/common/use-spring";
import { useTheme } from "hooks/use-theme";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { setJobActive, setJobValue } from "store/actions/jobs.action";
import { DashboardPage } from "store/models/dashboard.model";
import { px, scale } from "utils/udim2";

function Esp() {
	const dispatch = useAppDispatch();
	const theme = useTheme("apps").players;
	const active = useAppSelector((state) => state.jobs.esp.active);
	const fillJob = useAppSelector((state) => state.jobs.espFill);
	const outlineJob = useAppSelector((state) => state.jobs.espOutline);

	const [hovered, setHovered] = useState(false);
	const [fillValue, setFillValue] = useBinding(fillJob.value);
	const [outlineValue, setOutlineValue] = useBinding(outlineJob.value);

	const accent = theme.highlight.esp;

	const toggleBackground = useSpring(
		active
			? accent
			: hovered
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(accent, 0.1)
			: theme.button.background,
		{},
	);
	const toggleForeground = useSpring(
		active && theme.button.foregroundAccent ? theme.button.foregroundAccent : theme.button.foreground,
		{},
	);
	const toggleTextTransparency = useSpring(
		active ? 0 : hovered ? theme.button.foregroundTransparency - 0.25 : theme.button.foregroundTransparency,
		{},
	);

	return (
		<Card index={2} page={DashboardPage.Apps} theme={theme} size={px(326, 376)} position={new UDim2(0, 374, 1, 0)}>
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

			{/* Live preview box */}
			<Canvas size={px(278, 100)} position={px(24, 60)}>
				<Fill color={theme.button.background} radius={16} transparency={theme.button.backgroundTransparency} />
				<Border color={theme.foreground} radius={16} transparency={0.9} />

				{/* Target highlight mockup — updates live as sliders move */}
				<Canvas size={px(80, 68)} position={px(99, 16)}>
					<Fill color={accent} radius={14} transparency={fillValue.map((v) => 1 - v / 100)} />
					<Border color={accent} radius={14} transparency={outlineValue.map((v) => 1 - v / 100)} />
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
					accentColor={accent}
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

				{/* Fill label */}
				<Canvas size={px(73, 49)} position={px(205, 0)}>
					<Fill color={theme.button.background} radius={8} transparency={theme.button.backgroundTransparency} />
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
					accentColor={accent}
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

				{/* Outline label */}
				<Canvas size={px(73, 49)} position={px(205, 0)}>
					<Fill color={theme.button.background} radius={8} transparency={theme.button.backgroundTransparency} />
					{theme.button.outlined && <Border color={theme.button.foreground} radius={8} transparency={0.8} />}
					<textlabel
						Text="Outline"
						Font="GothamBold"
						TextSize={13}
						TextColor3={theme.button.foreground}
						TextTransparency={theme.button.foregroundTransparency}
						TextXAlignment="Center"
						TextYAlignment="Center"
						Size={scale(1, 1)}
						BackgroundTransparency={1}
					/>
				</Canvas>
			</Canvas>

			{/* Toggle button */}
			<BrightButton
				onActivate={() => dispatch(setJobActive("esp", !active))}
				onHover={(isHovered) => {
					setHovered(isHovered);
					if (isHovered) {
						dispatch(setHint("<font face='GothamBlack'>Highlight</font> other players with ESP outlines"));
					} else {
						dispatch(clearHint());
					}
				}}
				size={px(278, 49)}
				position={px(24, 302)}
				radius={12}
				color={toggleBackground}
				borderEnabled={theme.button.outlined}
				borderColor={toggleForeground}
				transparency={theme.button.backgroundTransparency}
			>
				<textlabel
					Text={active ? "Disable ESP" : "Enable ESP"}
					Font="GothamBold"
					TextSize={16}
					TextColor3={toggleForeground}
					TextTransparency={toggleTextTransparency}
					Size={scale(1, 1)}
					BackgroundTransparency={1}
				/>
			</BrightButton>
		</Card>
	);
}

export default hooked(Esp);
