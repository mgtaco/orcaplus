import { HttpService } from "@rbxts/services";
import { getStore } from "jobs/helpers/job-store";
import { RootState } from "store/store";

if (makefolder && !isfolder("_orca")) {
	makefolder("_orca");
}

function read(file: string) {
	if (readfile) {
		return isfile(file) ? readfile(file) : undefined;
	} else {
		print(`READ   ${file}`);
		return;
	}
}

function write(file: string, content: string) {
	if (writefile) {
		return writefile(file, content);
	} else {
		print(`WRITE  ${file} => \n${content}`);
		return;
	}
}

export function persistentState<T extends object>(name: string, selector: (state: RootState) => T, defaultValue: T): T {
	try {
		const serializedState = read(`_orca/${name}.json`);

		autosave(name, selector).catch(() => {
			warn("Autosave failed");
		});

		if (serializedState === undefined) {
			write(`_orca/${name}.json`, HttpService.JSONEncode(defaultValue));
			return defaultValue;
		}

		return HttpService.JSONDecode(serializedState) as T;
	} catch (err) {
		warn(`Failed to load ${name}.json: ${err}`);
		return defaultValue;
	}
}

async function autosave(name: string, selector: (state: RootState) => object) {
	const store = await getStore();

	function save(slice: object) {
		write(`_orca/${name}.json`, HttpService.JSONEncode(slice));
	}

	let previous = selector(store.getState());
	store.changed.connect((newState: RootState) => {
		const current = selector(newState);
		if (current !== previous) {
			previous = current;
			save(current);
		}
	});
}
