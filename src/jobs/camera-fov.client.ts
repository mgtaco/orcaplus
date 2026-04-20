import { Workspace } from "@rbxts/services";
import { getStore, onJobChange } from "jobs/helpers/job-store";

function applyFov(fov: number) {
	const cam = Workspace.CurrentCamera;
	if (cam) {
		cam.FieldOfView = math.clamp(fov, 1, 120);
	}
}

async function main() {
	const store = await getStore();
	applyFov(store.getState().jobs.cameraFov.value);

	Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
		applyFov(store.getState().jobs.cameraFov.value);
	});

	await onJobChange("cameraFov", (job) => {
		applyFov(job.value);
	});
}

main().catch((err) => {
	warn(`[camera-fov] ${err}`);
});
