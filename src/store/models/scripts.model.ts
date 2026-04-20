export interface CustomScript {
	id: string;
	name: string;
	filename: string;
	code: string;
}

export interface ScriptsState {
	scripts: CustomScript[];
}
