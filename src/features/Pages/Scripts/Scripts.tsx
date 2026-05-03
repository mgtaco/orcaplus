import Roact from "@rbxts/roact";
import { pure } from "@rbxts/roact-hooked";
import Canvas from "components/Canvas";
import { scale } from "utils/udim2";
import ScriptManager from "features/Pages/Scripts/ScriptManager";

function Scripts() {
	return (
		<Canvas position={scale(0, 1)} anchor={new Vector2(0, 1)}>
			<ScriptManager />
		</Canvas>
	);
}

export default pure(Scripts);
