import Rodux from "@rbxts/rodux";
import type { CustomScript } from "store/models/scripts.model";

export type ScriptsAction =
	| Rodux.InferActionFromCreator<typeof addScript>
	| Rodux.InferActionFromCreator<typeof removeScript>
	| Rodux.InferActionFromCreator<typeof refreshScripts>
	| Rodux.InferActionFromCreator<typeof updateScript>;

export const addScript = Rodux.makeActionCreator("scripts/add", (entry: CustomScript) => ({ script: entry }));
export const removeScript = Rodux.makeActionCreator("scripts/remove", (id: string) => ({ id }));
export const refreshScripts = Rodux.makeActionCreator("scripts/refresh", (scripts: CustomScript[]) => ({ scripts }));
export const updateScript = Rodux.makeActionCreator("scripts/update", (entry: CustomScript) => ({ script: entry }));
