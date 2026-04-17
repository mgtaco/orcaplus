import { Players, RunService } from "@rbxts/services";
import { getStore, onJobChange } from "jobs/helpers/job-store";

const LOCAL_PLAYER = Players.LocalPlayer;
const HIGHLIGHT_NAME = "OrcaESP";
const ESP_COLOR = Color3.fromRGB(255, 100, 100);

let espConnection: RBXScriptConnection | undefined;
const highlights = new Map<Model, Highlight>();

function getLivingCharacter(player: Player) {
	const character = player.Character;
	if (!character) return undefined;
	const humanoid = character.FindFirstChildWhichIsA("Humanoid");
	if (!humanoid || humanoid.Health <= 0) return undefined;
	return character;
}

function opacityToTransparency(opacity: number) {
	return 1 - math.clamp(opacity, 0, 100) / 100;
}

function applyTransparencies(highlight: Highlight, fillOpacity: number, outlineOpacity: number) {
	highlight.FillTransparency = opacityToTransparency(fillOpacity);
	highlight.OutlineTransparency = opacityToTransparency(outlineOpacity);
}

function addHighlight(character: Model, fillOpacity: number, outlineOpacity: number) {
	let highlight = highlights.get(character);
	if (!highlight) {
		const existing = character.FindFirstChild(HIGHLIGHT_NAME);
		if (existing?.IsA("Highlight")) {
			highlight = existing;
		} else {
			highlight = new Instance("Highlight");
			highlight.Name = HIGHLIGHT_NAME;
			highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop;
			highlight.FillColor = ESP_COLOR;
			highlight.OutlineColor = ESP_COLOR;
			highlight.Adornee = character;
			highlight.Parent = character;
		}
		highlights.set(character, highlight);
	}
	applyTransparencies(highlight, fillOpacity, outlineOpacity);
}

function removeHighlight(character: Model) {
	const highlight = highlights.get(character);
	if (!highlight) return;
	highlight.Destroy();
	highlights.delete(character);
}

function clearHighlights() {
	highlights.forEach((_, character) => removeHighlight(character));
}

function syncHighlights(fillOpacity: number, outlineOpacity: number) {
	const seen = new Set<Model>();

	for (const player of Players.GetPlayers()) {
		if (player === LOCAL_PLAYER) continue;
		const character = getLivingCharacter(player);
		if (character) {
			seen.add(character);
			addHighlight(character, fillOpacity, outlineOpacity);
		}
	}

	highlights.forEach((_, character) => {
		if (!character.Parent || !seen.has(character)) {
			removeHighlight(character);
		}
	});
}

function startESP(fillOpacity: number, outlineOpacity: number) {
	if (espConnection) return;
	syncHighlights(fillOpacity, outlineOpacity);
	espConnection = RunService.Heartbeat.Connect(() => {
		// re-read from highlights map to keep transparencies current as values may change
		syncHighlights(fillOpacity, outlineOpacity);
	});
}

function stopESP() {
	if (espConnection) {
		espConnection.Disconnect();
		espConnection = undefined;
	}
	clearHighlights();
}

async function main() {
	const store = await getStore();

	const getOpacities = () => {
		const state = store.getState().jobs;
		return { fill: state.espFill.value, outline: state.espOutline.value };
	};

	if (store.getState().jobs.esp.active) {
		const { fill, outline } = getOpacities();
		startESP(fill, outline);
	}

	Players.PlayerRemoving.Connect((player) => {
		if (player !== LOCAL_PLAYER && player.Character) {
			removeHighlight(player.Character);
		}
	});

	await onJobChange("esp", (job) => {
		if (job.active) {
			const { fill, outline } = getOpacities();
			startESP(fill, outline);
		} else {
			stopESP();
		}
	});

	// Restart the loop when fill or outline changes so the closure picks up new values
	await onJobChange("espFill", (job) => {
		if (store.getState().jobs.esp.active) {
			stopESP();
			const outline = store.getState().jobs.espOutline.value;
			startESP(job.value, outline);
		}
	});

	await onJobChange("espOutline", (job) => {
		if (store.getState().jobs.esp.active) {
			stopESP();
			const fill = store.getState().jobs.espFill.value;
			startESP(fill, job.value);
		}
	});
}

main().catch((err) => {
	warn(`[esp-worker] ${err}`);
});
