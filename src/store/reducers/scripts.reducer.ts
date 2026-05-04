import Rodux from "@rbxts/rodux";
import { HttpService } from "@rbxts/services";
import { ScriptsAction } from "store/actions/scripts.action";
import type { CustomScript, ScriptsState } from "store/models/scripts.model";
import { ensureScriptsFolder, loadScriptsFromFolder, SCRIPTS_FOLDER, toFilename } from "utils/script-files";

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

function loadInitialScripts(): CustomScript[] {
	ensureScriptsFolder();
	migrateFromJson();
	return loadScriptsFromFolder();
}

const initialState: ScriptsState = {
	scripts: loadInitialScripts(),
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
	"scripts/refresh": (state, action) => ({
		...state,
		scripts: action.scripts.map((entry) => {
			const existing = state.scripts.find((s) => s.filename === entry.filename);
			return existing === undefined ? entry : { ...entry, id: existing.id, name: existing.name };
		}),
	}),
	"scripts/update": (state, action) => ({
		...state,
		scripts: state.scripts.map((s) => (s.id === action.script.id ? action.script : s)),
	}),
});
