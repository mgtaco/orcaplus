import type { JobsState } from "store/models/jobs.model";
import type { RootState, RootStore } from "store/store";
import { setInterval } from "utils/timeout";

type Cleanup = () => void;
type RoduxConnection = { disconnect(): void };
type Clearable = { clear(): void };

interface OrcaSession {
	alive: boolean;
	cleanups: Array<Cleanup>;
}

interface OrcaGlobal extends Record<string, unknown> {
	_ORCA_SESSION?: OrcaSession;
	_ORCA_IS_LOADED?: boolean;
	_ORCA_ROOT?: Instance;
}

const store: { current?: RootStore } = {};

function getOrcaGlobal() {
	return getgenv ? (getgenv() as OrcaGlobal) : undefined;
}

function cleanupSession(target: OrcaSession) {
	if (!target.alive) {
		return;
	}

	target.alive = false;
	const cleanups = [...target.cleanups];
	target.cleanups = [];

	for (let index = cleanups.size() - 1; index >= 0; index--) {
		const [ok, err] = pcall(cleanups[index]);
		if (!ok) {
			warn(`[Orca] Cleanup failed: ${err}`);
		}
	}
}

function startSession(): OrcaSession {
	const g = getOrcaGlobal();
	if (!g) {
		return { alive: true, cleanups: [] };
	}

	const previous = g._ORCA_SESSION;
	if (previous) {
		cleanupSession(previous);
	}

	const newSession: OrcaSession = { alive: true, cleanups: [] };
	g._ORCA_SESSION = newSession;
	g._ORCA_IS_LOADED = undefined;

	const root = g._ORCA_ROOT;
	if (root) {
		newSession.cleanups.push(() => {
			if (g._ORCA_ROOT === root) {
				g._ORCA_ROOT = undefined;
			}
			root.Destroy();
		});
	}

	return newSession;
}

const session = startSession();

export function trackCleanup(cleanup: Cleanup) {
	if (session.alive) {
		session.cleanups.push(cleanup);
	} else {
		pcall(cleanup);
	}

	return cleanup;
}

export function trackConnection<T extends RBXScriptConnection>(connection: T) {
	trackCleanup(() => connection.Disconnect());
	return connection;
}

export function trackRoduxConnection<T extends RoduxConnection>(connection: T) {
	trackCleanup(() => connection.disconnect());
	return connection;
}

export function trackTimeout<T extends Clearable>(timeout: T) {
	trackCleanup(() => timeout.clear());
	return timeout;
}

export function trackPromise<T>(promise: Promise<T>) {
	trackCleanup(() => promise.cancel());
	return promise;
}

export function isOrcaAlive() {
	return session.alive;
}

export function assertOrcaAlive() {
	if (!session.alive) {
		throw "Orca has been unloaded";
	}
}

export function setStore(newStore: RootStore) {
	if (store.current) {
		throw "Store has already been set";
	}
	store.current = newStore;
	trackCleanup(() => {
		if (store.current === newStore) {
			store.current = undefined;
		}
		newStore.destruct();
	});
}

export async function getStore() {
	if (store.current) {
		return store.current;
	}
	return new Promise<RootStore>((resolve, _, onCancel) => {
		const interval = trackTimeout(
			setInterval(() => {
				if (store.current) {
					resolve(store.current);
					interval.clear();
				}
			}, 100),
		);
		onCancel(() => {
			interval.clear();
		});
	});
}

export async function onJobChange<K extends keyof JobsState>(
	jobName: K,
	callback: (job: JobsState[K], state: RootState) => void,
) {
	const store = await getStore();
	let lastJob = store.getState().jobs[jobName];

	return trackRoduxConnection(
		store.changed.connect((newState) => {
			const job = newState.jobs[jobName];
			if (!shallowEqual(job, lastJob)) {
				lastJob = job;
				task.defer(() => {
					if (isOrcaAlive()) {
						callback(job, newState);
					}
				});
			}
		}),
	);
}

function shallowEqual(a: object, b: object) {
	for (const [key] of pairs(a)) {
		if (a[key as never] !== b[key as never]) {
			return false;
		}
	}
	return true;
}
