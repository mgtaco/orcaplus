import { Players, RunService } from "@rbxts/services";
import { getStore, onJobChange } from "jobs/helpers/job-store";

const LOCAL_PLAYER = Players.LocalPlayer;
const HIGHLIGHT_NAME = "OrcaESP";
const NAMETAG_NAME = "OrcaESPName";
const HEALTHBAR_NAME = "OrcaESPHealth";

let espConnection: RBXScriptConnection | undefined;

const highlights = new Map<Model, Highlight>();
const nameTags = new Map<Model, BillboardGui>();
const healthBars = new Map<Model, { bar: BillboardGui; fill: Frame }>();

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

// ── Highlights ────────────────────────────────────────────────────────────────

function addHighlight(character: Model, fillOpacity: number, outlineOpacity: number, color: Color3) {
	let highlight = highlights.get(character);
	if (!highlight) {
		const existing = character.FindFirstChild(HIGHLIGHT_NAME);
		highlight = existing?.IsA("Highlight") ? existing : new Instance("Highlight");
		highlight.Name = HIGHLIGHT_NAME;
		highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop;
		highlight.Adornee = character;
		highlight.Parent = character;
		highlights.set(character, highlight);
	}
	highlight.FillColor = color;
	highlight.OutlineColor = color;
	highlight.FillTransparency = opacityToTransparency(fillOpacity);
	highlight.OutlineTransparency = opacityToTransparency(outlineOpacity);
}

function removeHighlight(character: Model) {
	const h = highlights.get(character);
	if (!h) return;
	h.Destroy();
	highlights.delete(character);
}

function applyColorToAll(color: Color3) {
	highlights.forEach((h) => {
		h.FillColor = color;
		h.OutlineColor = color;
	});
}

// ── Name tags ─────────────────────────────────────────────────────────────────

function addNameTag(character: Model, player: Player, color: Color3) {
	if (nameTags.has(character)) {
		const tag = nameTags.get(character)!;
		(tag.FindFirstChildWhichIsA("TextLabel") as TextLabel).TextColor3 = color;
		return;
	}
	const head = character.FindFirstChild("Head") as BasePart | undefined;
	if (!head) return;

	const billboard = new Instance("BillboardGui");
	billboard.Name = NAMETAG_NAME;
	billboard.Adornee = head;
	billboard.StudsOffset = new Vector3(0, 2.2, 0);
	billboard.Size = new UDim2(0, 120, 0, 22);
	billboard.AlwaysOnTop = true;
	billboard.ResetOnSpawn = false;

	const label = new Instance("TextLabel");
	label.Text = player.DisplayName;
	label.Font = Enum.Font.GothamBold;
	label.TextSize = 13;
	label.TextColor3 = color;
	label.TextStrokeColor3 = new Color3(0, 0, 0);
	label.TextStrokeTransparency = 0.4;
	label.BackgroundTransparency = 1;
	label.Size = new UDim2(1, 0, 1, 0);
	label.Parent = billboard;

	billboard.Parent = head;
	nameTags.set(character, billboard);
}

function removeNameTag(character: Model) {
	const tag = nameTags.get(character);
	if (!tag) return;
	tag.Destroy();
	nameTags.delete(character);
}

// ── Health bars ───────────────────────────────────────────────────────────────

function addHealthBar(character: Model, color: Color3) {
	const humanoid = character.FindFirstChildWhichIsA("Humanoid");
	if (!humanoid) return;

	if (healthBars.has(character)) {
		const { fill } = healthBars.get(character)!;
		fill.BackgroundColor3 = color;
		fill.Size = new UDim2(humanoid.Health / humanoid.MaxHealth, 0, 1, 0);
		return;
	}

	const head = character.FindFirstChild("Head") as BasePart | undefined;
	if (!head) return;

	const billboard = new Instance("BillboardGui");
	billboard.Name = HEALTHBAR_NAME;
	billboard.Adornee = head;
	billboard.StudsOffset = new Vector3(0, 3.1, 0);
	billboard.Size = new UDim2(0, 80, 0, 7);
	billboard.AlwaysOnTop = true;
	billboard.ResetOnSpawn = false;

	const bg = new Instance("Frame");
	bg.Size = new UDim2(1, 0, 1, 0);
	bg.BackgroundColor3 = new Color3(0.1, 0.1, 0.1);
	bg.BackgroundTransparency = 0.3;
	bg.BorderSizePixel = 0;
	bg.Parent = billboard;
	new Instance("UICorner").Parent = bg;

	const fill = new Instance("Frame");
	fill.Size = new UDim2(humanoid.Health / humanoid.MaxHealth, 0, 1, 0);
	fill.BackgroundColor3 = color;
	fill.BackgroundTransparency = 0;
	fill.BorderSizePixel = 0;
	fill.Parent = bg;
	new Instance("UICorner").Parent = fill;

	billboard.Parent = head;
	healthBars.set(character, { bar: billboard, fill });
}

function removeHealthBar(character: Model) {
	const entry = healthBars.get(character);
	if (!entry) return;
	entry.bar.Destroy();
	healthBars.delete(character);
}

// ── Sync loop ─────────────────────────────────────────────────────────────────

interface EspState {
	highlight: boolean;
	name: boolean;
	health: boolean;
	fill: number;
	outline: number;
	color: Color3;
}

function syncAll(state: EspState) {
	const seen = new Set<Model>();

	for (const player of Players.GetPlayers()) {
		if (player === LOCAL_PLAYER) continue;
		const character = getLivingCharacter(player);
		if (!character) continue;

		seen.add(character);

		if (state.highlight) {
			addHighlight(character, state.fill, state.outline, state.color);
		} else {
			removeHighlight(character);
		}

		if (state.name) {
			addNameTag(character, player, state.color);
		} else {
			removeNameTag(character);
		}

		if (state.health) {
			addHealthBar(character, state.color);
		} else {
			removeHealthBar(character);
		}
	}

	// Clean up characters that left
	highlights.forEach((_, c) => { if (!seen.has(c)) removeHighlight(c); });
	nameTags.forEach((_, c) => { if (!seen.has(c)) removeNameTag(c); });
	healthBars.forEach((_, c) => { if (!seen.has(c)) removeHealthBar(c); });
}

function clearAll() {
	highlights.forEach((_, c) => removeHighlight(c));
	nameTags.forEach((_, c) => removeNameTag(c));
	healthBars.forEach((_, c) => removeHealthBar(c));
}

function startLoop(state: EspState) {
	if (espConnection) {
		espConnection.Disconnect();
		espConnection = undefined;
	}
	syncAll(state);
	espConnection = RunService.Heartbeat.Connect(() => syncAll(state));
}

function stopLoop() {
	if (espConnection) {
		espConnection.Disconnect();
		espConnection = undefined;
	}
}

function anyActive(state: EspState) {
	return state.highlight || state.name || state.health;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
	const store = await getStore();

	const getState = (): EspState => {
		const jobs = store.getState().jobs;
		return {
			highlight: jobs.esp.active,
			name: jobs.espName.active,
			health: jobs.espHealth.active,
			fill: jobs.espFill.value,
			outline: jobs.espOutline.value,
			color: hueToColor(jobs.espHue.value),
		};
	};

	const refresh = () => {
		const state = getState();
		if (anyActive(state)) {
			startLoop(state);
		} else {
			stopLoop();
			clearAll();
		}
	};

	Players.PlayerRemoving.Connect((player) => {
		if (player !== LOCAL_PLAYER && player.Character) {
			removeHighlight(player.Character);
			removeNameTag(player.Character);
			removeHealthBar(player.Character);
		}
	});

	if (anyActive(getState())) refresh();

	await onJobChange("esp", refresh);
	await onJobChange("espName", refresh);
	await onJobChange("espHealth", refresh);
	await onJobChange("espFill", refresh);
	await onJobChange("espOutline", refresh);
	await onJobChange("espHue", () => {
		applyColorToAll(getState().color);
		refresh();
	});
}

main().catch((err) => {
	warn(`[esp-worker] ${err}`);
});
