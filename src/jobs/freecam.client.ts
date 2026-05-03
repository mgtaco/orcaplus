import { onJobChange, trackCleanup } from "jobs/helpers/job-store";
import { DisableFreecam, EnableFreecam } from "jobs/helpers/freecam";

async function main() {
	trackCleanup(DisableFreecam);

	await onJobChange("freecam", (job) => {
		if (job.active) {
			EnableFreecam();
		} else {
			DisableFreecam();
		}
	});
}

main().catch((err) => {
	warn(`[freecam-worker] ${err}`);
});
