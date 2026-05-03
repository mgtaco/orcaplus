import Roact from "@rbxts/roact";
import { hooked } from "@rbxts/roact-hooked";
import { Players } from "@rbxts/services";
import Canvas from "components/Canvas";
import { useDelayedUpdate } from "hooks/common/use-delayed-update";
import { useSpring } from "hooks/common/use-spring";
import { useIsPageOpen } from "hooks/use-current-page";
import { useTheme } from "hooks/use-theme";
import { DashboardPage } from "store/models/dashboard.model";
import { lerp } from "utils/number-util";
import { px } from "utils/udim2";

const AVATAR_SIZE = 150;
const AVATAR_RING_SIZE = 178;
const AVATAR_RING_THICKNESS = 4;
const AVATAR = `https://www.roblox.com/headshot-thumbnail/image?userId=${Players.LocalPlayer.UserId}&width=150&height=150&format=png`;

function Avatar() {
	const theme = useTheme("home").profile;
	const isOpen = useIsPageOpen(DashboardPage.Home);
	const isActive = useDelayedUpdate(isOpen, isOpen ? 275 : 0);
	const visibility = useSpring(isActive ? 1 : 0, { frequency: 4 });

	return (
		<Canvas anchor={new Vector2(0.5, 0)} size={px(186, 186)} position={new UDim2(0.5, 0, 0, 24)}>
			<imagelabel
				Image={AVATAR}
				Size={px(AVATAR_SIZE, AVATAR_SIZE)}
				Position={px(18, 18)}
				BackgroundColor3={theme.avatar.background}
				BackgroundTransparency={theme.avatar.transparency}
			>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</imagelabel>

			<frame
				Size={visibility.map((n) => px(AVATAR_RING_SIZE * n, AVATAR_RING_SIZE * n))}
				Position={px(93, 93)}
				AnchorPoint={new Vector2(0.5, 0.5)}
				BackgroundTransparency={1}
			>
				<uistroke
					Color={new Color3(1, 1, 1)}
					Thickness={visibility.map((n) => lerp(AVATAR_SIZE / 2 + 2, AVATAR_RING_THICKNESS, n))}
					Transparency={visibility.map((n) => lerp(1, 0, n))}
				>
					<uigradient
						Color={theme.avatar.gradient.color}
						Transparency={theme.avatar.gradient.transparency}
						Rotation={theme.avatar.gradient.rotation}
					/>
				</uistroke>
				<uicorner CornerRadius={new UDim(1, 0)} />
			</frame>
		</Canvas>
	);
}

export default hooked(Avatar);
