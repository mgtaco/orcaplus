import Roact from "@rbxts/roact";
import { hooked, useBinding, useState } from "@rbxts/roact-hooked";
import BrightButton from "components/BrightButton";
import BrightSlider from "components/BrightSlider";
import Canvas from "components/Canvas";
import { SpringOptions } from "hooks/common/flipper-hooks";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useDelayedUpdate } from "hooks/common/use-delayed-update";
import { useSpring } from "hooks/common/use-spring";
import { useIsPageOpen } from "hooks/use-current-page";
import { useTheme } from "hooks/use-theme";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { setJobActive, setJobValue } from "store/actions/jobs.action";
import { DashboardPage } from "store/models/dashboard.model";
import { JobsWithValue } from "store/models/jobs.model";
import { px, scale } from "utils/udim2";

const SPRING_OPTIONS: SpringOptions = {
	frequency: 5,
};
const SLIDER_WIDTH = 181;
const BUTTON_WIDTH = 85;
const BUTTON_OFFSET = 193;
const ROW_WIDTH = 278;
const ROW_HEIGHT = 49;

function Sliders() {
	return (
		<Canvas size={px(278, 187)} position={px(0, 368)}>
			<Slider
				order={0}
				display="Flight"
				hint="<font face='GothamBlack'>Configure flight</font> in studs per second"
				jobName="flight"
				units="studs/s"
				min={10}
				max={100}
				position={0}
			/>
			<Slider
				order={1}
				display="Speed"
				hint="<font face='GothamBlack'>Configure speed</font> in studs per second"
				jobName="walkSpeed"
				units="studs/s"
				min={0}
				max={100}
				position={69}
			/>
			<Slider
				order={2}
				display="Jump"
				hint="<font face='GothamBlack'>Configure height</font> in studs"
				jobName="jumpHeight"
				units="studs"
				min={0}
				max={500}
				position={138}
			/>
		</Canvas>
	);
}

export default Sliders;

function SliderComponent(props: {
	order: number;
	display: string;
	hint: string;
	jobName: "flight" | "walkSpeed" | "jumpHeight";
	units: string;
	min: number;
	max: number;
	position: number;
}) {
	const theme = useTheme("home").profile;
	const dispatch = useAppDispatch();

	const job = useAppSelector((state) => state.jobs[props.jobName]);
	const [value, setValue] = useBinding(job.value); // Update for animation
	const [hovered, setHovered] = useState(false);
	const isOpen = useIsPageOpen(DashboardPage.Home);
	const isActive = useDelayedUpdate(isOpen, isOpen ? 200 + props.order * 50 : 0);

	const accent = theme.highlight[props.jobName];
	const sliderPosition = useSpring(isActive ? px(0, 0) : px(-SLIDER_WIDTH, 0), SPRING_OPTIONS);
	const buttonPosition = useSpring(isActive ? px(BUTTON_OFFSET, 0) : px(ROW_WIDTH + BUTTON_WIDTH, 0), SPRING_OPTIONS);

	const buttonBackground = useSpring(
		job.active
			? accent
			: hovered
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(accent, 0.1)
			: theme.button.background,
		{},
	);
	const buttonForeground = useSpring(
		job.active && theme.button.foregroundAccent ? theme.button.foregroundAccent : theme.foreground,
		{},
	);

	return (
		<Canvas size={px(ROW_WIDTH, ROW_HEIGHT)} position={px(0, props.position)} clipsDescendants>
			<Canvas size={px(SLIDER_WIDTH, ROW_HEIGHT)} position={sliderPosition}>
				<BrightSlider
					onValueChanged={setValue}
					onRelease={() => dispatch(setJobValue(props.jobName, math.round(value.getValue())))}
					min={props.min}
					max={props.max}
					initialValue={job.value}
					size={px(SLIDER_WIDTH, ROW_HEIGHT)}
					position={px(0, 0)}
					radius={8}
					color={theme.slider.background}
					accentColor={accent}
					borderEnabled={theme.slider.outlined}
					borderColor={theme.slider.foreground}
					transparency={theme.slider.backgroundTransparency}
					indicatorTransparency={theme.slider.indicatorTransparency}
				>
					<textlabel
						Font="GothamBold"
						Text={value.map((value) => `${math.round(value)} ${props.units}`)}
						TextSize={15}
						TextColor3={theme.slider.foreground}
						TextXAlignment="Center"
						TextYAlignment="Center"
						TextTransparency={theme.slider.foregroundTransparency}
						Size={scale(1, 1)}
						BackgroundTransparency={1}
					/>
				</BrightSlider>
			</Canvas>

			<BrightButton
				onActivate={() => dispatch(setJobActive(props.jobName, !job.active))}
				onHover={(hovered) => {
					if (hovered) {
						setHovered(true);
						dispatch(setHint(props.hint));
					} else {
						setHovered(false);
						dispatch(clearHint());
					}
				}}
				size={px(BUTTON_WIDTH, ROW_HEIGHT)}
				position={buttonPosition}
				radius={8}
				color={buttonBackground}
				borderEnabled={theme.button.outlined}
				borderColor={buttonForeground}
				transparency={theme.button.backgroundTransparency}
			>
				<textlabel
					Font="GothamBold"
					Text={props.display}
					TextSize={15}
					TextColor3={buttonForeground}
					TextXAlignment="Center"
					TextYAlignment="Center"
					TextTransparency={useSpring(
						job.active
							? 0
							: hovered
							? theme.button.foregroundTransparency - 0.25
							: theme.button.foregroundTransparency,
						{},
					)}
					Size={scale(1, 1)}
					BackgroundTransparency={1}
				/>
			</BrightButton>
		</Canvas>
	);
}

const Slider = hooked(SliderComponent);
