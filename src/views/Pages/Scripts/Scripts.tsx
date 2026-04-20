import Roact from "@rbxts/roact";
import { pure } from "@rbxts/roact-hooked";
import Canvas from "components/Canvas";
import * as http from "utils/http";
import { scale } from "utils/udim2";
import { BASE_PADDING } from "views/Pages/Scripts/constants";
import Content from "views/Pages/Scripts/Content";
import ScriptCard from "views/Pages/Scripts/ScriptCard";
import ScriptManager from "views/Pages/Scripts/ScriptManager";

async function runScriptFromUrl(url: string, src: string) {
	try {
		const content = await http.get(url);
		const [fn, err] = loadstring(content, "@" + src);
		assert(fn, `Failed to call loadstring on Lua script from '${url}': ${err}`);
		task.defer(fn);
	} catch (e) {
		warn(`Failed to run Lua script from '${url}': ${e}`);
		return "";
	}
}

function Scripts() {
	return (
		<Canvas position={scale(0, 1)} anchor={new Vector2(0, 1)}>
			{/* Infinite Yield – left 1/3 column */}
			<ScriptCard
				onActivate={() =>
					runScriptFromUrl(
						"https://raw.githubusercontent.com/EdgeIY/infiniteyield/master/source",
						"Infinite Yield",
					)
				}
				index={3}
				backgroundImage="rbxassetid://8992291444"
				backgroundImageSize={new Vector2(1023, 682)}
				dropshadow="rbxassetid://8992291268"
				dropshadowSize={new Vector2(1.15, 1.4)}
				dropshadowPosition={new Vector2(0.5, 0.6)}
				anchorPoint={new Vector2(0, 0.5)}
				size={new UDim2(1 / 3, -BASE_PADDING, 1, -BASE_PADDING)}
				position={new UDim2(0, BASE_PADDING / 2, 0.5, 0)}
			>
				<Content header="Infinite Yield" footer="github.com/EdgeIY" />
			</ScriptCard>

			{/* Script Manager – right 2/3 column (animated internally) */}
			<ScriptManager />
		</Canvas>
	);
}

export default pure(Scripts);
