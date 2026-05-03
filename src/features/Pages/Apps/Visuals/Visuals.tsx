import Roact from "@rbxts/roact";
import { hooked } from "@rbxts/roact-hooked";
import Canvas from "components/Canvas";
import Card from "components/Card";
import { useAppDispatch } from "hooks/common/rodux-hooks";
import { useTheme } from "hooks/use-theme";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { DashboardPage } from "store/models/dashboard.model";
import { px } from "utils/udim2";

import CameraFov from "./CameraFov";
import EspPanel from "./EspPanel";
import { espBlockHeight } from "./esp-layout";
import { CARD_H, CARD_PAD, CARD_SIZE, DIVIDER_H, getCameraLayout } from "./visuals.constants";

function Visuals() {
	const dispatch = useAppDispatch();
	const theme = useTheme("apps").players;

	const { yCameraTitle, yCameraSubtitle, yFovRow, bottomFovY } = getCameraLayout();

	const espH = espBlockHeight();
	const yEspTop = CARD_H - CARD_PAD - espH;
	const gapBetweenSections = yEspTop - bottomFovY;
	const innerPad = gapBetweenSections - DIVIDER_H;
	const padAboveDivider = innerPad >= 0 ? math.floor(innerPad / 2) : 0;
	const yDivider = bottomFovY + padAboveDivider;

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

			<CameraFov theme={theme} yCameraTitle={yCameraTitle} yCameraSubtitle={yCameraSubtitle} yFovRow={yFovRow} />

			<frame
				Size={new UDim2(1, -CARD_PAD * 2, 0, DIVIDER_H)}
				Position={px(CARD_PAD, yDivider)}
				BackgroundColor3={theme.foreground}
				BackgroundTransparency={0.75}
				BorderSizePixel={0}
			/>

			<Canvas anchor={new Vector2(0, 1)} position={new UDim2(0, CARD_PAD, 1, -CARD_PAD)} size={px(278, espH)}>
				<EspPanel theme={theme} />
			</Canvas>
		</Card>
	);
}

export default hooked(Visuals);
