import { HttpService } from "@rbxts/services";
import type { CustomScript } from "store/models/scripts.model";

export const ORCA_FOLDER = "_orca";
export const SCRIPTS_FOLDER = "_orca/scripts";

export function ensureScriptsFolder(): void {
	if (!isfolder || !makefolder) return;

	if (!isfolder(ORCA_FOLDER)) {
		makefolder(ORCA_FOLDER);
	}
	if (!isfolder(SCRIPTS_FOLDER)) {
		makefolder(SCRIPTS_FOLDER);
	}
}

/**
 * Converts a display name into a safe filename (no path separators, max 64 chars).
 */
export function toFilename(name: string): string {
	const filename = name.split("/").join("_").split("\\").join("_").sub(1, 64);
	return filename === "" ? "script" : filename;
}

/**
 * Extracts the bare name (no extension, no directory) from a full file path.
 * Handles both forward-slash and back-slash separators.
 */
export function basenameNoExt(filePath: string): string {
	const fwdParts = filePath.split("/");
	const bwdParts = fwdParts[fwdParts.size() - 1].split("\\");
	const filename = bwdParts[bwdParts.size() - 1];
	return filename.sub(1, -5); // strip last 4 chars (".lua")
}

function readPathFor(filePath: string): string {
	const fwdParts = filePath.split("/");
	const bwdParts = fwdParts[fwdParts.size() - 1].split("\\");
	const filename = bwdParts[bwdParts.size() - 1];

	return filename === filePath ? `${SCRIPTS_FOLDER}/${filename}` : filePath;
}

export function loadScriptsFromFolder(): CustomScript[] {
	ensureScriptsFolder();
	if (!listfiles || !readfile) return [];

	const loaded: CustomScript[] = [];
	let filePaths: string[];
	try {
		filePaths = listfiles(SCRIPTS_FOLDER);
	} catch (e) {
		warn(`[Orca] Could not list saved scripts: ${e}`);
		return loaded;
	}

	filePaths.sort((a, b) => basenameNoExt(a).lower() < basenameNoExt(b).lower());
	for (const filePath of filePaths) {
		if (filePath.lower().sub(-4) !== ".lua") continue;

		const filename = basenameNoExt(filePath);
		if (filename === "") continue;

		try {
			loaded.push({
				id: HttpService.GenerateGUID(false),
				name: filename,
				filename,
				code: readfile(readPathFor(filePath)),
			});
		} catch (e) {
			warn(`[Orca] Could not read script '${filePath}': ${e}`);
		}
	}

	return loaded;
}
