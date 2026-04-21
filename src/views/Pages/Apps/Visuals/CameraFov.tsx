import Roact from "@rbxts/roact";
import { hooked, useBinding, useState } from "@rbxts/roact-hooked";
import Border from "components/Border";
import BrightSlider from "components/BrightSlider";
import Canvas from "components/Canvas";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useSpring } from "hooks/common/use-spring";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { setJobValue } from "store/actions/jobs.action";
import { Theme } from "themes/theme.interface";
import { px, scale } from "utils/udim2";

import { CARD_PAD, DEFAULT_CAMERA_FOV, SECTION_HEADING_H, SECTION_HEADING_TEXT, SLIDER_H } from "./visuals.constants";

interface Props {
	theme: Theme["apps"]["players"];
	yCameraTitle: number;
	yCameraSubtitle: number;
	yFovRow: number;
}

function CameraFov({ theme, yCameraTitle, yCameraSubtitle, yFovRow }: Props) {
	const dispatch = useAppDispatch();
	const cameraFovJob = useAppSelector((state) => state.jobs.cameraFov);

	const [fovValue, setFovValue] = useBinding(cameraFovJob.value);
	const [fovSliderKey, setFovSliderKey] = useState(0);
	const [resetHover, setResetHover] = useState(false);

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

	return (
		<>
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
		</>
	);
}

export default hooked(CameraFov);
