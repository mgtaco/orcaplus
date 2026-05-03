import Roact from "@rbxts/roact";
import { hooked, useEffect, useState } from "@rbxts/roact-hooked";
import { Players } from "@rbxts/services";
import Canvas from "components/Canvas";
import { useAppSelector } from "hooks/common/rodux-hooks";
import { useSpring } from "hooks/common/use-spring";
import { useIsPageOpen } from "hooks/use-current-page";
import { useTheme } from "hooks/use-theme";
import { DashboardPage } from "store/models/dashboard.model";
import { lerp } from "utils/number-util";
import { clearTimeout, setTimeout } from "utils/timeout";
import { px } from "utils/udim2";

const AVATAR_SIZE = 150;
const AVATAR_RING_SIZE = 178;
const AVATAR_RING_THICKNESS = 4;
const AVATAR_REPLAY_DELAY = 75;
const AVATAR_PAGE_DELAY = 275;

function Avatar() {
	const theme = useTheme("apps").players;
	const isOpen = useIsPageOpen(DashboardPage.Apps);
	const playerSelected = useAppSelector((state) =>
		state.dashboard.apps.playerSelected !== undefined
			? (Players.FindFirstChild(state.dashboard.apps.playerSelected) as Player | undefined)
			: undefined,
	);
	const userId = playerSelected ? playerSelected.UserId : Players.LocalPlayer.UserId;
	const [hasOpened, setHasOpened] = useState(false);
	const [isRingVisible, setRingVisible] = useState(false);
	const visibility = useSpring(isRingVisible ? 1 : 0, { frequency: 4 });

	useEffect(() => {
		setRingVisible(false);

		if (!isOpen) {
			setHasOpened(false);
			return;
		}

		const timeout = setTimeout(
			() => {
				setRingVisible(true);
				setHasOpened(true);
			},
			hasOpened ? AVATAR_REPLAY_DELAY : AVATAR_PAGE_DELAY,
		);

		return () => clearTimeout(timeout);
	}, [isOpen, userId]);

	return (
		<Canvas anchor={new Vector2(0.5, 0)} size={px(186, 186)} position={new UDim2(0.5, 0, 0, 24)}>
			<imagelabel
				Image={`https://www.roblox.com/headshot-thumbnail/image?userId=${userId}&width=150&height=150&format=png`}
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
