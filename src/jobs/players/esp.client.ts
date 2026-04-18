import { Players, RunService } from "@rbxts/services";
import { getStore, onJobChange } from "jobs/helpers/job-store";

const LOCAL_PLAYER = Players.LocalPlayer;
const HIGHLIGHT_NAME = "OrcaESP";

let espConnection: RBXScriptConnection | undefined;
const highlights = new Map<Model, Highlight>();

function hueToColor(hue: number): Color3 {
	return Color3.fromHSV(hue / 360, 1, 1);
}

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

function applyColorToAll(color: Color3) {
	highlights.forEach((highlight) => {
		highlight.FillColor = color;
		highlight.OutlineColor = color;
	});
}

function addHighlight(character: Model, fillOpacity: number, outlineOpacity: number, color: Color3) {
	let highlight = highlights.get(character);
	if (!highlight) {
		const existing = character.FindFirstChild(HIGHLIGHT_NAME);
		if (existing?.IsA("Highlight")) {
			highlight = existing;
		} else {
			highlight = new Instance("Highlight");
			highlight.Name = HIGHLIGHT_NAME;
			highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop;
			highlight.Adornee = character;
			highlight.Parent = character;
		}
		highlights.set(character, highlight);
	}
	highlight.FillColor = color;
	highlight.OutlineColor = color;
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

function syncHighlights(fillOpacity: number, outlineOpacity: number, color: Color3) {
	const seen = new Set<Model>();

	for (const player of Players.GetPlayers()) {
		if (player === LOCAL_PLAYER) continue;
		const character = getLivingCharacter(player);
		if (character) {
			seen.add(character);
			addHighlight(character, fillOpacity, outlineOpacity, color);
		}
	}

	highlights.forEach((_, character) => {
		if (!character.Parent || !seen.has(character)) {
			removeHighlight(character);
		}
	});
}

function startESP(fillOpacity: number, outlineOpacity: number, color: Color3) {
	if (espConnection) return;
	syncHighlights(fillOpacity, outlineOpacity, color);
	espConnection = RunService.Heartbeat.Connect(() => {
		syncHighlights(fillOpacity, outlineOpacity, color);
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

	const getState = () => {
		const jobs = store.getState().jobs;
		return {
			fill: jobs.espFill.value,
			outline: jobs.espOutline.value,
			color: hueToColor(jobs.espHue.value),
		};
	};

	if (store.getState().jobs.esp.active) {
		const { fill, outline, color } = getState();
		startESP(fill, outline, color);
	}

	Players.PlayerRemoving.Connect((player) => {
		if (player !== LOCAL_PLAYER && player.Character) {
			removeHighlight(player.Character);
		}
	});

	await onJobChange("esp", (job) => {
		if (job.active) {
			const { fill, outline, color } = getState();
			startESP(fill, outline, color);
		} else {
			stopESP();
		}
	});

	await onJobChange("espFill", (job) => {
		if (store.getState().jobs.esp.active) {
			stopESP();
			const { outline, color } = getState();
			startESP(job.value, outline, color);
		}
	});

	await onJobChange("espOutline", (job) => {
		if (store.getState().jobs.esp.active) {
			stopESP();
			const { fill, color } = getState();
			startESP(fill, job.value, color);
		}
	});

	await onJobChange("espHue", (job) => {
		const color = hueToColor(job.value);
		applyColorToAll(color);
		if (store.getState().jobs.esp.active) {
			stopESP();
			const { fill, outline } = getState();
			startESP(fill, outline, color);
		}
	});
}

main().catch((err) => {
	warn(`[esp-worker] ${err}`);
});
