import { Workspace } from "@rbxts/services";
import { getStore, onJobChange, trackCleanup, trackConnection } from "jobs/helpers/job-store";

let defaultFov: number | undefined;

function applyFov(fov: number) {
	const cam = Workspace.CurrentCamera;
	if (cam) {
		if (defaultFov === undefined) {
			defaultFov = cam.FieldOfView;
		}
		cam.FieldOfView = math.clamp(fov, 1, 120);
	}
}

async function main() {
	const store = await getStore();
	applyFov(store.getState().jobs.cameraFov.value);

	trackCleanup(() => {
		const cam = Workspace.CurrentCamera;
		if (cam && defaultFov !== undefined) {
			cam.FieldOfView = defaultFov;
		}
	});

	trackConnection(
		Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
			applyFov(store.getState().jobs.cameraFov.value);
		}),
	);

	await onJobChange("cameraFov", (job) => {
		applyFov(job.value);
	});
}

main().catch((err) => {
	warn(`[camera-fov] ${err}`);
});
