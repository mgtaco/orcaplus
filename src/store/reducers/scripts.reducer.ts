import Rodux from "@rbxts/rodux";
import { HttpService } from "@rbxts/services";
import { ScriptsAction } from "store/actions/scripts.action";
import { CustomScript, ScriptsState } from "store/models/scripts.model";
import { basenameNoExt, SCRIPTS_FOLDER, toFilename } from "utils/script-files";

function ensureFolder(): void {
	if (isfolder && !isfolder(SCRIPTS_FOLDER)) {
		makefolder(SCRIPTS_FOLDER);
	}
}

/** One-time migration: if old scripts.json exists, save each entry as a .lua file. */
function migrateFromJson(): void {
	if (!isfile || !readfile || !writefile || !delfile) return;
	if (!isfile("_orca/scripts.json")) return;
	try {
		const raw = readfile("_orca/scripts.json");
		const data = HttpService.JSONDecode(raw) as { scripts: Array<{ name: string; code: string }> };
		for (const s of data.scripts) {
			const filename = toFilename(s.name);
			writefile(`${SCRIPTS_FOLDER}/${filename}.lua`, s.code ?? "");
		}
		delfile("_orca/scripts.json");
	} catch (e) {
		warn(`[Orca] scripts.json migration failed: ${e}`);
	}
}

function loadScriptsFromFolder(): CustomScript[] {
	ensureFolder();
	migrateFromJson();

	if (!listfiles || !readfile) return [];

	const loaded: CustomScript[] = [];
	for (const filePath of listfiles(SCRIPTS_FOLDER)) {
		if (filePath.sub(-4) !== ".lua") continue;
		const filename = basenameNoExt(filePath);
		if (filename === "") continue;
		try {
			loaded.push({
				id: HttpService.GenerateGUID(false),
				name: filename,
				filename,
				code: readfile(filePath),
			});
		} catch (e) {
			warn(`[Orca] Could not read script '${filePath}': ${e}`);
		}
	}
	return loaded;
}

const initialState: ScriptsState = {
	scripts: loadScriptsFromFolder(),
};

export const scriptsReducer = Rodux.createReducer<ScriptsState, ScriptsAction>(initialState, {
	"scripts/add": (state, action) => ({
		...state,
		scripts: [...state.scripts, action.script],
	}),
	"scripts/remove": (state, action) => ({
		...state,
		scripts: state.scripts.filter((s) => s.id !== action.id),
	}),
});
