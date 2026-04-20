export const SCRIPTS_FOLDER = "_orca/scripts";

/**
 * Converts a display name into a safe filename (no path separators, max 64 chars).
 */
export function toFilename(name: string): string {
	return name.split("/").join("_").split("\\").join("_").sub(1, 64) || "script";
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
