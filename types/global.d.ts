declare const VERSION: string;

interface DrawingLine {
	Visible: boolean;
	From: Vector2;
	To: Vector2;
	Color: Color3;
	Thickness: number;
	Remove(): void;
}

/** Exploit Drawing API — `Drawing.new("Line")` */
interface DrawingAPI {
	new: (shapeType: "Line") => DrawingLine;
}

declare const Drawing: DrawingAPI | undefined;

declare const queue_on_teleport: ((script: string) => void) | undefined;

declare const gethui: (() => BasePlayerGui) | undefined;

declare const protect_gui: ((object: ScreenGui) => void) | undefined;

declare namespace syn {
	function queue_on_teleport(script: string): void;
	function protect_gui(object: ScreenGui): void;
}
