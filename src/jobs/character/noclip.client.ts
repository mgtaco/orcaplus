import { Players, RunService } from "@rbxts/services";
import { onJobChange, trackCleanup, trackConnection } from "jobs/helpers/job-store";

const player = Players.LocalPlayer;
const originalCollisions = new Map<BasePart, boolean>();
let enabled = false;

async function main() {
	trackCleanup(() => {
		enabled = false;
		restoreCollisions();
	});

	await onJobChange("noclip", (job) => {
		enabled = job.active;
		if (enabled) {
			snapshotCollisions();
		} else {
			restoreCollisions();
		}
	});

	const disableCollisions = () => {
		if (!enabled) {
			return;
		}
		const character = player.Character;
		if (!character) {
			return;
		}
		for (const descendant of character.GetDescendants()) {
			if (descendant.IsA("BasePart") && descendant.CanCollide) {
				if (!originalCollisions.has(descendant)) {
					originalCollisions.set(descendant, true);
				}
				descendant.CanCollide = false;
			}
		}
	};

	trackConnection(RunService.Stepped.Connect(disableCollisions));
	trackConnection(RunService.Heartbeat.Connect(disableCollisions));

	trackConnection(
		player.CharacterAdded.Connect(() => {
			originalCollisions.clear();
		}),
	);
}

function snapshotCollisions() {
	originalCollisions.clear();
	const character = player.Character;
	if (!character) {
		return;
	}
	for (const descendant of character.GetDescendants()) {
		if (descendant.IsA("BasePart")) {
			originalCollisions.set(descendant, descendant.CanCollide);
		}
	}
}

function restoreCollisions() {
	for (const [part, canCollide] of originalCollisions) {
		if (part.Parent !== undefined) {
			part.CanCollide = canCollide;
		}
	}
	originalCollisions.clear();
}

main().catch((err) => {
	warn(`[noclip-worker] ${err}`);
});
