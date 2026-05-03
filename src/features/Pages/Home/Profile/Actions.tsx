import Roact from "@rbxts/roact";
import { hooked } from "@rbxts/roact-hooked";
import ActionButton from "components/ActionButton";
import Canvas from "components/Canvas";
import { useDelayedUpdate } from "hooks/common/use-delayed-update";
import { useSpring } from "hooks/common/use-spring";
import { useIsPageOpen } from "hooks/use-current-page";
import { useTheme } from "hooks/use-theme";
import { DashboardPage } from "store/models/dashboard.model";
import { JobsState } from "store/models/jobs.model";
import { Theme } from "themes/theme.interface";
import { px } from "utils/udim2";

const BUTTON_WIDTH = 61;
const BUTTON_HEIGHT = 49;
const HIDDEN_Y = BUTTON_HEIGHT + 48;

function Actions() {
	const theme = useTheme("home").profile;
	return (
		<Canvas
			anchor={new Vector2(0.5, 0)}
			size={px(278, BUTTON_HEIGHT)}
			position={new UDim2(0.5, 0, 0, 575)}
			clipsDescendants
		>
			<AnimatedActionButton
				order={0}
				action="refresh"
				hint="<font face='GothamBlack'>Refresh</font> your character at this location"
				theme={theme}
				image="rbxassetid://8992253511"
				position={px(0, 0)}
			/>
			<AnimatedActionButton
				order={1}
				action="noclip"
				hint="<font face='GothamBlack'>Toggle noclip</font> to walk through walls"
				theme={theme}
				image="rbxassetid://8992253792"
				position={px(72, 0)}
				canDeactivate
			/>
			<AnimatedActionButton
				order={2}
				action="godmode"
				hint="<font face='GothamBlack'>Set godmode</font>, may break respawn"
				theme={theme}
				image="rbxassetid://8992253678"
				position={px(145, 0)}
			/>
			<AnimatedActionButton
				order={3}
				action="freecam"
				hint="<font face='GothamBlack'>Set freecam</font>, use Q & E to move vertically"
				theme={theme}
				image="rbxassetid://8992253933"
				position={px(217, 0)}
				canDeactivate
			/>
		</Canvas>
	);
}

export default hooked(Actions);

function AnimatedActionButtonComponent({
	order,
	action,
	hint,
	theme,
	image,
	position,
	canDeactivate,
}: {
	order: number;
	action: keyof JobsState;
	hint: string;
	theme: Theme["home"]["profile"];
	image: string;
	position: UDim2;
	canDeactivate?: boolean;
}) {
	const isOpen = useIsPageOpen(DashboardPage.Home);
	const isActive = useDelayedUpdate(isOpen, isOpen ? 200 + order * 50 : 0);
	const animatedPosition = useSpring(isActive ? position : position.add(px(0, HIDDEN_Y)), { frequency: 5 });

	return (
		<Canvas size={px(BUTTON_WIDTH, BUTTON_HEIGHT)} position={animatedPosition}>
			<ActionButton
				action={action}
				hint={hint}
				theme={theme}
				image={image}
				position={px(0, 0)}
				canDeactivate={canDeactivate}
			/>
		</Canvas>
	);
}

const AnimatedActionButton = hooked(AnimatedActionButtonComponent);
