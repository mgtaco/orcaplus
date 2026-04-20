import Roact from "@rbxts/roact";
import { hooked, useEffect, useMutable, useState } from "@rbxts/roact-hooked";
import { HttpService } from "@rbxts/services";
import Border from "components/Border";
import Canvas from "components/Canvas";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useDelayedUpdate } from "hooks/common/use-delayed-update";
import { useIsMount } from "hooks/common/use-did-mount";
import { useForcedUpdate } from "hooks/common/use-forced-update";
import { useSpring } from "hooks/common/use-spring";
import { useIsPageOpen } from "hooks/use-current-page";
import { addScript, removeScript } from "store/actions/scripts.action";
import { DashboardPage } from "store/models/dashboard.model";
import { hex } from "utils/color3";
import { px, scale } from "utils/udim2";
import { SCRIPTS_FOLDER, toFilename } from "utils/script-files";
import { BASE_PADDING } from "./constants";

const ROW_HEIGHT = 56;
const ROW_GAP = 8;
const HEADER_HEIGHT = 72;
const FORM_HEIGHT = 300;
const INNER_PAD = 20;

const PANEL_BG = hex("#0d1117");
const ROW_BG = hex("#161b22");
const ACCENT_GREEN = hex("#238636");
const ACCENT_BLUE = hex("#1f6feb");
const ACCENT_RED = hex("#cf2929");
const TEXT_MAIN = hex("#e6edf3");
const TEXT_MUTED = hex("#7d8590");
const BORDER_COLOR = hex("#30363d");

function runCode(code: string, name: string) {
	try {
		const [fn, err] = loadstring(code, "@" + name);
		assert(fn, `Failed to compile script '${name}': ${err}`);
		task.defer(fn as () => void);
	} catch (e) {
		warn(`Failed to run script '${name}': ${e}`);
	}
}

interface RowProps {
	name: string;
	index: number;
	onRun: () => void;
	onDelete: () => void;
}

function ScriptRow({ name, index, onRun, onDelete }: RowProps) {
	const [runHover, setRunHover] = useState(false);
	const [delHover, setDelHover] = useState(false);
	const runBg = useSpring(runHover ? ACCENT_BLUE : hex("#0d1829"), {});
	const delBg = useSpring(delHover ? ACCENT_RED : hex("#1a0d0d"), {});

	return (
		<Canvas
			size={new UDim2(1, -(INNER_PAD * 2), 0, ROW_HEIGHT)}
			position={px(INNER_PAD, INNER_PAD + index * (ROW_HEIGHT + ROW_GAP))}
		>
			<Fill color={ROW_BG} transparency={0.3} radius={10} />
			<Border color={BORDER_COLOR} radius={10} transparency={0.6} />

			{/* Script name */}
			<textlabel
				Text={name}
				Font="GothamBold"
				TextSize={16}
				TextColor3={TEXT_MAIN}
				TextXAlignment="Left"
				TextYAlignment="Center"
				Position={px(14, 0)}
				Size={new UDim2(1, -108, 1, 0)}
				BackgroundTransparency={1}
				TextTruncate="AtEnd"
			/>

			{/* Run button */}
			<Canvas size={px(40, 40)} position={new UDim2(1, -90, 0.5, -20)}>
				<Fill color={runBg} radius={8} />
				<Border color={ACCENT_BLUE} radius={8} transparency={useSpring(runHover ? 0.3 : 0.7, {})} />
				<textlabel
					Text="▶"
					Font="GothamBold"
					TextSize={14}
					TextColor3={TEXT_MAIN}
					TextXAlignment="Center"
					TextYAlignment="Center"
					Size={scale(1, 1)}
					BackgroundTransparency={1}
				/>
				<textbutton
					Text=""
					Size={scale(1, 1)}
					Transparency={1}
					Event={{
						Activated: () => onRun(),
						MouseEnter: () => setRunHover(true),
						MouseLeave: () => setRunHover(false),
					}}
				/>
			</Canvas>

			{/* Delete button */}
			<Canvas size={px(40, 40)} position={new UDim2(1, -44, 0.5, -20)}>
				<Fill color={delBg} radius={8} />
				<Border color={ACCENT_RED} radius={8} transparency={useSpring(delHover ? 0.3 : 0.7, {})} />
				<textlabel
					Text="✕"
					Font="GothamBold"
					TextSize={14}
					TextColor3={TEXT_MAIN}
					TextXAlignment="Center"
					TextYAlignment="Center"
					Size={scale(1, 1)}
					BackgroundTransparency={1}
				/>
				<textbutton
					Text=""
					Size={scale(1, 1)}
					Transparency={1}
					Event={{
						Activated: () => onDelete(),
						MouseEnter: () => setDelHover(true),
						MouseLeave: () => setDelHover(false),
					}}
				/>
			</Canvas>
		</Canvas>
	);
}

const ScriptRowHooked = hooked(ScriptRow);

function ScriptManager() {
	const dispatch = useAppDispatch();
	const scripts = useAppSelector((state) => state.scripts.scripts);

	const isCurrentlyOpen = useIsPageOpen(DashboardPage.Scripts);
	const isOpen = useIsMount() ? false : isCurrentlyOpen;
	const isTransitioning = useDelayedUpdate(isOpen, 2 * 30);

	const forceUpdate = useForcedUpdate();
	useEffect(() => forceUpdate(), []);

	const [showForm, setShowForm] = useState(false);
	const nameRef = useMutable("");
	const codeRef = useMutable("");

	const finalPosition = new UDim2(1 / 3, BASE_PADDING / 2, 0.5, 0);
	const animPosition = useSpring(
		isTransitioning ? finalPosition : finalPosition.add(new UDim2(0, 0, 1, 48 * 3 + 56)),
		{ frequency: 2.2, dampingRatio: 0.75 },
	);

	function handleAdd() {
		const name = nameRef.current;
		const code = codeRef.current;
		if (name === "" || code === "") return;

		const filename = toFilename(name);
		try {
			writefile(`${SCRIPTS_FOLDER}/${filename}.lua`, code);
		} catch (e) {
			warn(`[Orca] Failed to save script '${filename}': ${e}`);
		}

		dispatch(
			addScript({
				id: HttpService.GenerateGUID(false),
				name,
				filename,
				code,
			}),
		);
		setShowForm(false);
		nameRef.current = "";
		codeRef.current = "";
	}

	function closeForm() {
		setShowForm(false);
		nameRef.current = "";
		codeRef.current = "";
	}

	const listTopOffset = HEADER_HEIGHT + 1 + (showForm ? FORM_HEIGHT + 1 : 0);
	const canvasH =
		scripts.size() > 0
			? INNER_PAD * 2 + scripts.size() * (ROW_HEIGHT + ROW_GAP) - ROW_GAP
			: INNER_PAD * 2 + 64;

	return (
		<Canvas
			size={new UDim2(2 / 3, -BASE_PADDING, 1, -BASE_PADDING)}
			position={animPosition}
			anchor={new Vector2(0, 0.5)}
		>
			{/* Panel background */}
			<Fill color={PANEL_BG} transparency={0.08} radius={20} />
			<Border color={BORDER_COLOR} radius={20} transparency={0.5} />

			{/* Header: title */}
			<textlabel
				Text="Script Manager"
				Font="GothamBlack"
				TextSize={22}
				TextColor3={TEXT_MAIN}
				TextXAlignment="Left"
				TextYAlignment="Center"
				Position={px(INNER_PAD, 0)}
				Size={new UDim2(1, -(INNER_PAD + 72), 0, HEADER_HEIGHT)}
				BackgroundTransparency={1}
			/>

			{/* Header: toggle add/close button */}
			<Canvas size={px(40, 40)} position={new UDim2(1, -56, 0, 16)}>
				<Fill color={useSpring(showForm ? hex("#3a1a1a") : hex("#1a2e1a"), {})} radius={10} />
				<Border color={showForm ? ACCENT_RED : ACCENT_GREEN} radius={10} transparency={0.4} />
				<textlabel
					Text={showForm ? "✕" : "+"}
					Font="GothamBlack"
					TextSize={showForm ? 16 : 22}
					TextColor3={TEXT_MAIN}
					TextXAlignment="Center"
					TextYAlignment="Center"
					Size={scale(1, 1)}
					BackgroundTransparency={1}
				/>
				<textbutton
					Text=""
					Size={scale(1, 1)}
					Transparency={1}
					Event={{
						Activated: () => (showForm ? closeForm() : setShowForm(true)),
					}}
				/>
			</Canvas>

			{/* Header separator */}
			<frame
				Size={new UDim2(1, -(INNER_PAD * 2), 0, 1)}
				Position={px(INNER_PAD, HEADER_HEIGHT)}
				BackgroundColor3={BORDER_COLOR}
				BackgroundTransparency={0.4}
				BorderSizePixel={0}
			/>

			{/* Add form */}
			{showForm && (
				<Canvas
					size={new UDim2(1, 0, 0, FORM_HEIGHT)}
					position={px(0, HEADER_HEIGHT + 1)}
					padding={{ left: INNER_PAD, right: INNER_PAD, top: 14, bottom: 14 }}
				>
					{/* Name input */}
					<frame
						Size={new UDim2(1, 0, 0, 38)}
						Position={px(0, 0)}
						BackgroundColor3={hex("#060a0f")}
						BackgroundTransparency={0}
						BorderSizePixel={0}
					>
						<uicorner CornerRadius={new UDim(0, 8)} />
						<Border color={BORDER_COLOR} radius={8} transparency={0.3} />
						<textbox
							Text=""
							PlaceholderText="Script name"
							PlaceholderColor3={TEXT_MUTED}
							Font="Gotham"
							TextSize={15}
							TextColor3={TEXT_MAIN}
							TextXAlignment="Left"
							TextYAlignment="Center"
							ClearTextOnFocus={false}
							Position={px(12, 0)}
							Size={new UDim2(1, -24, 1, 0)}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							Change={{
								Text: (rbx) => {
									nameRef.current = rbx.Text;
								},
							}}
						/>
					</frame>

					{/* Code input (multiline) */}
					<frame
						Size={new UDim2(1, 0, 0, 196)}
						Position={px(0, 46)}
						BackgroundColor3={hex("#060a0f")}
						BackgroundTransparency={0}
						BorderSizePixel={0}
						ClipsDescendants={true}
					>
						<uicorner CornerRadius={new UDim(0, 8)} />
						<Border color={BORDER_COLOR} radius={8} transparency={0.3} />
						<textbox
							Text=""
							PlaceholderText={"-- paste or write your Lua script here\nprint(\"Hello from Orca!\")"}
							PlaceholderColor3={TEXT_MUTED}
							Font="Code"
							TextSize={13}
							TextColor3={TEXT_MAIN}
							TextXAlignment="Left"
							TextYAlignment="Top"
							MultiLine={true}
							ClearTextOnFocus={false}
							Position={px(10, 8)}
							Size={new UDim2(1, -20, 1, -16)}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							Change={{
								Text: (rbx) => {
									codeRef.current = rbx.Text;
								},
							}}
						/>
					</frame>

					{/* Add button */}
					<frame
						Size={new UDim2(1, 0, 0, 38)}
						Position={px(0, 250)}
						BackgroundColor3={ACCENT_GREEN}
						BackgroundTransparency={0.15}
						BorderSizePixel={0}
					>
						<uicorner CornerRadius={new UDim(0, 8)} />
						<Border color={ACCENT_GREEN} radius={8} transparency={0.5} />
						<textbutton
							Text="Save Script"
							Font="GothamBold"
							TextSize={15}
							TextColor3={TEXT_MAIN}
							Size={scale(1, 1)}
							Transparency={1}
							Event={{
								Activated: () => handleAdd(),
							}}
						/>
					</frame>
				</Canvas>
			)}

			{/* Form separator */}
			{showForm && (
				<frame
					Size={new UDim2(1, -(INNER_PAD * 2), 0, 1)}
					Position={px(INNER_PAD, HEADER_HEIGHT + 1 + FORM_HEIGHT)}
					BackgroundColor3={BORDER_COLOR}
					BackgroundTransparency={0.4}
					BorderSizePixel={0}
				/>
			)}

			{/* Script list */}
			<Canvas
				size={new UDim2(1, 0, 1, -listTopOffset)}
				position={px(0, listTopOffset)}
				clipsDescendants
			>
				<scrollingframe
					Size={scale(1, 1)}
					CanvasSize={new UDim2(0, 0, 0, canvasH)}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					ScrollBarImageTransparency={0.75}
					ScrollBarThickness={4}
					ScrollingDirection="Y"
				>
					{scripts.size() === 0 && (
						<textlabel
							Text={"No scripts yet\nClick  +  to write your first script"}
							Font="Gotham"
							TextSize={15}
							TextColor3={TEXT_MUTED}
							TextXAlignment="Center"
							TextYAlignment="Center"
							AnchorPoint={new Vector2(0.5, 0)}
							Size={new UDim2(1, 0, 0, 64)}
							Position={new UDim2(0.5, 0, 0, INNER_PAD)}
							BackgroundTransparency={1}
						/>
					)}
					{scripts.map((entry, i) => (
						<ScriptRowHooked
							Key={entry.id}
							name={entry.name}
							index={i}
							onRun={() => runCode(entry.code, entry.name)}
							onDelete={() => {
								try {
									delfile(`${SCRIPTS_FOLDER}/${entry.filename}.lua`);
								} catch {}
								dispatch(removeScript(entry.id));
							}}
						/>
					))}
				</scrollingframe>
			</Canvas>
		</Canvas>
	);
}

export default hooked(ScriptManager);
