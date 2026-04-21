import Roact from "@rbxts/roact";
import { hooked, useBinding, useEffect, useState } from "@rbxts/roact-hooked";
import { HttpService } from "@rbxts/services";
import Acrylic from "components/Acrylic";
import Border from "components/Border";
import Canvas from "components/Canvas";
import Fill from "components/Fill";
import { useAppDispatch, useAppSelector } from "hooks/common/rodux-hooks";
import { useDelayedUpdate } from "hooks/common/use-delayed-update";
import { useIsMount } from "hooks/common/use-did-mount";
import { useForcedUpdate } from "hooks/common/use-forced-update";
import { useSpring } from "hooks/common/use-spring";
import { useIsPageOpen } from "hooks/use-current-page";
import { useTheme } from "hooks/use-theme";
import { clearHint, setHint } from "store/actions/dashboard.action";
import { addScript, removeScript, updateScript } from "store/actions/scripts.action";
import { DashboardPage } from "store/models/dashboard.model";
import { Theme } from "themes/theme.interface";
import { px, scale } from "utils/udim2";
import { SCRIPTS_FOLDER, toFilename } from "utils/script-files";
import { BASE_PADDING } from "./constants";

const ROW_HEIGHT = 56;
const ROW_GAP = 8;
const HEADER_HEIGHT = 72;
const FORM_HEIGHT = 300;
const INNER_PAD = 20;

const springPanel = { frequency: 2.2, dampingRatio: 0.78 };
const springReveal = { frequency: 2.5, dampingRatio: 0.88 };
const springLayout = { frequency: 2.6, dampingRatio: 0.82 };
const springRowEnter = { frequency: 3.2, dampingRatio: 0.78 };
const springRowExit = { frequency: 3.2, dampingRatio: 1 };
const springRunPing = { frequency: 5, dampingRatio: 0.62 };

const DELETE_ANIM_SEC = 0.48;
const HINT_RUN_OK_SEC = 2.2;
const HINT_RUN_ERR_SEC = 3.5;
const HINT_NAME_TAKEN_SEC = 2.8;

const SCRIPT_ICON_CROSS = "rbxassetid://100953464106901";
const SCRIPT_ICON_PLUS = "rbxassetid://129192126219257";
const SCRIPT_ICON_RUN = "rbxassetid://83476009110981";
const SCRIPT_ICON_EDIT = "rbxassetid://111130813561810";

const ICON_INSET_40 = 22;

/** Divider / hairlines — blend fg/bg so light themes don’t get a harsh white rule (see Sorbet + Card `outlined`). */
function subtleHairline(theme: Theme["apps"]["players"]): Color3 {
	return theme.foreground.Lerp(theme.background, 0.58);
}

interface RowProps {
	theme: Theme["apps"]["players"];
	name: string;
	index: number;
	isExiting: boolean;
	onRun: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

function ScriptRow({ theme, name, index, isExiting, onRun, onEdit, onDelete }: RowProps) {
	const [runHover, setRunHover] = useState(false);
	const [editHover, setEditHover] = useState(false);
	const [delHover, setDelHover] = useState(false);
	const [entered, setEntered] = useState(0);
	const [runPing, setRunPing] = useState(0);

	const targetY = INNER_PAD + index * (ROW_HEIGHT + ROW_GAP);
	const yLayout = useSpring(targetY, springLayout);

	useEffect(() => {
		task.defer(() => setEntered(1));
	}, []);

	const enterT = useSpring(entered, springRowEnter);
	const exitT = useSpring(isExiting ? 1 : 0, springRowExit);
	const runPingSpr = useSpring(runPing, springRunPing);

	const yPos = Roact.joinBindings({ yLayout, enterT }).map(({ yLayout, enterT }) =>
		math.round(yLayout - (1 - enterT) * 18),
	);
	const rowFillTransparency = Roact.joinBindings({ enterT, exitT }).map(({ enterT, exitT }) =>
		math.min(1, math.max(0, 0.25 + (1 - enterT) * 0.5 + exitT * 0.62)),
	);
	const glyphFade = Roact.joinBindings({ enterT, exitT }).map(({ enterT, exitT }) =>
		math.min(1, math.max(0, (1 - enterT) * 0.4 + exitT * 0.85)),
	);
	const rowScale = exitT.map((t) => math.max(0.04, 1 - t * 0.92));

	const runAccent = theme.highlight.teleport;
	const editAccent = theme.highlight.spectate;
	const delAccent = theme.highlight.kill;
	const runBgBase = useSpring(
		runHover
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(runAccent, 0.35)
			: theme.button.background,
		{},
	);
	const runFill = Roact.joinBindings({ runBgBase, runPingSpr }).map(({ runBgBase, runPingSpr }) =>
		runBgBase.Lerp(runAccent, runPingSpr * 0.5),
	);
	const editBg = useSpring(
		editHover
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(editAccent, 0.35)
			: theme.button.background,
		{},
	);
	const delBg = useSpring(
		delHover
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(delAccent, 0.35)
			: theme.button.background,
		{},
	);

	function handleRun() {
		setRunPing(1);
		task.delay(0.12, () => setRunPing(0));
		onRun();
	}

	return (
		<Canvas
			size={new UDim2(1, -(INNER_PAD * 2), 0, ROW_HEIGHT)}
			position={yPos.map((y) => new UDim2(0, INNER_PAD, 0, y))}
		>
			<uiscale Scale={rowScale} />
			<Fill color={theme.button.background} transparency={rowFillTransparency} radius={10} />
			{theme.button.outlined && <Border color={theme.button.foreground} radius={10} transparency={0.8} />}

			<textlabel
				Text={name}
				Font="GothamBold"
				TextSize={16}
				TextColor3={theme.foreground}
				TextTransparency={glyphFade}
				TextXAlignment="Left"
				TextYAlignment="Center"
				Position={px(14, 0)}
				Size={new UDim2(1, -184, 1, 0)}
				BackgroundTransparency={1}
				TextTruncate="AtEnd"
			/>

			<Canvas size={px(40, 40)} position={new UDim2(1, -136, 0.5, -20)}>
				<Fill color={editBg} radius={8} />
				<Border color={editAccent} radius={8} transparency={useSpring(editHover ? 0.35 : 0.72, {})} />
				<imagelabel
					Image={SCRIPT_ICON_EDIT}
					ImageColor3={theme.foreground}
					ImageTransparency={glyphFade}
					ScaleType={Enum.ScaleType.Fit}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={scale(0.5, 0.5)}
					Size={px(ICON_INSET_40, ICON_INSET_40)}
				/>
				<textbutton
					Text=""
					AutoButtonColor={false}
					Size={scale(1, 1)}
					BackgroundTransparency={1}
					Active={!isExiting}
					Event={{
						Activated: () => {
							if (!isExiting) onEdit();
						},
						MouseEnter: () => {
							if (!isExiting) setEditHover(true);
						},
						MouseLeave: () => setEditHover(false),
					}}
				/>
			</Canvas>

			<Canvas size={px(40, 40)} position={new UDim2(1, -90, 0.5, -20)}>
				<Fill color={runFill} radius={8} />
				<Border color={runAccent} radius={8} transparency={useSpring(runHover ? 0.35 : 0.72, {})} />
				<imagelabel
					Image={SCRIPT_ICON_RUN}
					ImageColor3={theme.foreground}
					ImageTransparency={glyphFade}
					ScaleType={Enum.ScaleType.Fit}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={scale(0.5, 0.5)}
					Size={px(ICON_INSET_40, ICON_INSET_40)}
				/>
				<textbutton
					Text=""
					AutoButtonColor={false}
					Size={scale(1, 1)}
					BackgroundTransparency={1}
					Event={{
						Activated: () => handleRun(),
						MouseEnter: () => setRunHover(true),
						MouseLeave: () => setRunHover(false),
					}}
				/>
			</Canvas>

			<Canvas size={px(40, 40)} position={new UDim2(1, -44, 0.5, -20)}>
				<Fill color={delBg} radius={8} />
				<Border color={delAccent} radius={8} transparency={useSpring(delHover ? 0.35 : 0.72, {})} />
				<imagelabel
					Image={SCRIPT_ICON_CROSS}
					ImageColor3={theme.foreground}
					ImageTransparency={glyphFade}
					ScaleType={Enum.ScaleType.Fit}
					BackgroundTransparency={1}
					AnchorPoint={new Vector2(0.5, 0.5)}
					Position={scale(0.5, 0.5)}
					Size={px(ICON_INSET_40, ICON_INSET_40)}
				/>
				<textbutton
					Text=""
					AutoButtonColor={false}
					Size={scale(1, 1)}
					BackgroundTransparency={1}
					Active={!isExiting}
					Event={{
						Activated: () => {
							if (!isExiting) onDelete();
						},
						MouseEnter: () => {
							if (!isExiting) setDelHover(true);
						},
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
	const theme = useTheme("apps").players;
	const scripts = useAppSelector((state) => state.scripts.scripts);
	const [exitingScriptId, setExitingScriptId] = useState<string | undefined>(undefined);

	const isCurrentlyOpen = useIsPageOpen(DashboardPage.Scripts);
	const isOpen = useIsMount() ? false : isCurrentlyOpen;
	const isTransitioning = useDelayedUpdate(isOpen, 2 * 30);

	const forceUpdate = useForcedUpdate();
	useEffect(() => forceUpdate(), []);

	const [showForm, setShowForm] = useState(false);
	const [editingScriptId, setEditingScriptId] = useState<string | undefined>(undefined);
	const [addHover, setAddHover] = useState(false);
	const [saveHover, setSaveHover] = useState(false);
	const [nameText, setNameText] = useBinding("");
	const [codeText, setCodeText] = useBinding("");

	const finalPosition = new UDim2(1 / 3, BASE_PADDING / 2, 0.5, 0);
	const animPosition = useSpring(
		isTransitioning ? finalPosition : finalPosition.add(new UDim2(0, 0, 1, 48 * 3 + 56)),
		springPanel,
	);

	const formReveal = useSpring(showForm ? 1 : 0, springReveal);
	const formBlockH = formReveal.map((t) => math.round(t * (FORM_HEIGHT + 1)));
	const listTopBinding = formBlockH.map((h) => HEADER_HEIGHT + 1 + h);

	const scrollContentH = INNER_PAD * 2 + math.max(64, scripts.size() * (ROW_HEIGHT + ROW_GAP) - ROW_GAP);
	const scrollCanvasH = useSpring(scrollContentH, springLayout);

	const addAccent = theme.highlight.espEnabled;
	const closeAccent = theme.highlight.kill;
	const headerToggleFill = useSpring(
		showForm
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(closeAccent, 0.22)
			: addHover
			? theme.button.backgroundHovered ?? theme.button.background.Lerp(addAccent, 0.22)
			: theme.button.background,
		{},
	);
	const headerToggleStroke = useSpring(showForm ? closeAccent : addAccent, {});

	function openNewForm() {
		setEditingScriptId(undefined);
		setNameText("");
		setCodeText("");
		setShowForm(true);
	}

	function openEditForm(entry: { id: string; name: string; code: string }) {
		setEditingScriptId(entry.id);
		setNameText(entry.name);
		setCodeText(entry.code);
		setShowForm(true);
	}

	function closeForm() {
		setShowForm(false);
		setEditingScriptId(undefined);
		setNameText("");
		setCodeText("");
	}

	/** If the script being edited is removed (e.g. deleted while the form is open), drop edit mode so the UI cannot get stuck. */
	useEffect(() => {
		if (editingScriptId === undefined) return;
		if (scripts.find((s) => s.id === editingScriptId) === undefined) {
			setShowForm(false);
			setEditingScriptId(undefined);
			setNameText("");
			setCodeText("");
		}
	}, [scripts, editingScriptId]);

	function handleSave() {
		const name = nameText.getValue();
		const code = codeText.getValue();
		if (name === "" || code === "") return;

		const filename = toFilename(name);

		if (editingScriptId !== undefined) {
			const existing = scripts.find((s) => s.id === editingScriptId);
			if (existing === undefined) {
				closeForm();
				return;
			}

			const nameTaken = scripts.find((s) => s.filename === filename && s.id !== editingScriptId);
			if (nameTaken !== undefined) {
				dispatch(
					setHint(
						`<font face='GothamBlack'>Not saved</font> — another script already uses the name <b>${filename}</b>.`,
					),
				);
				task.delay(HINT_NAME_TAKEN_SEC, () => dispatch(clearHint()));
				return;
			}

			try {
				writefile(`${SCRIPTS_FOLDER}/${filename}.lua`, code);
				if (filename !== existing.filename) {
					delfile(`${SCRIPTS_FOLDER}/${existing.filename}.lua`);
				}
			} catch (e) {
				warn(`[Orca] Failed to update script '${filename}': ${e}`);
				return;
			}

			dispatch(
				updateScript({
					id: existing.id,
					name,
					filename,
					code,
				}),
			);
			closeForm();
			return;
		}

		if (scripts.find((s) => s.filename === filename) !== undefined) {
			dispatch(
				setHint(
					`<font face='GothamBlack'>Not saved</font> — <b>${filename}</b> already exists. Edit that script or pick another name.`,
				),
			);
			task.delay(HINT_NAME_TAKEN_SEC, () => dispatch(clearHint()));
			return;
		}

		try {
			writefile(`${SCRIPTS_FOLDER}/${filename}.lua`, code);
		} catch (e) {
			warn(`[Orca] Failed to save script '${filename}': ${e}`);
			return;
		}

		dispatch(
			addScript({
				id: HttpService.GenerateGUID(false),
				name,
				filename,
				code,
			}),
		);
		closeForm();
	}

	function runUserScript(code: string, name: string) {
		try {
			const [fn, err] = loadstring(code, "@" + name);
			assert(fn, `Failed to compile script '${name}': ${err}`);
			dispatch(setHint(`<font face='GothamBlack'>Running</font> <b>${name}</b> — queued on the next defer.`));
			task.defer(fn as () => void);
			task.delay(HINT_RUN_OK_SEC, () => dispatch(clearHint()));
		} catch (e) {
			warn(`Failed to run script '${name}': ${e}`);
			dispatch(setHint(`<font face='GothamBlack'>Run failed</font> — <b>${name}</b>: ${e}`));
			task.delay(HINT_RUN_ERR_SEC, () => dispatch(clearHint()));
		}
	}

	function scheduleDelete(entry: { id: string; filename: string }) {
		if (exitingScriptId !== undefined) return;
		setExitingScriptId(entry.id);
		task.delay(DELETE_ANIM_SEC, () => {
			try {
				delfile(`${SCRIPTS_FOLDER}/${entry.filename}.lua`);
			} catch (e) {
				warn(`[Orca] Could not delete script file: ${e}`);
			}
			dispatch(removeScript(entry.id));
			setExitingScriptId(undefined);
		});
	}

	const inputBg = theme.avatar.background;
	const hairline = subtleHairline(theme);
	const mutedFg = theme.foreground;
	const saveAccent = theme.highlight.espEnabled;
	const saveFill = useSpring(
		saveHover ? theme.button.backgroundHovered ?? saveAccent.Lerp(theme.foreground, 0.08) : saveAccent,
		{},
	);
	const saveLabelColor = useSpring(
		saveHover ? theme.button.foregroundAccent ?? theme.foreground : theme.foreground,
		{},
	);

	return (
		<Canvas
			size={new UDim2(2 / 3, -BASE_PADDING, 1, -BASE_PADDING)}
			position={animPosition}
			anchor={new Vector2(0, 0.5)}
		>
			<Fill
				color={theme.background}
				gradient={theme.backgroundGradient}
				transparency={theme.transparency}
				radius={20}
			/>
			{theme.acrylic && <Acrylic Key="acrylic" radius={20} />}
			{theme.outlined && <Border color={theme.foreground} radius={20} transparency={0.8} />}

			<textlabel
				Text="Script Manager"
				Font="GothamBlack"
				TextSize={22}
				TextColor3={theme.foreground}
				TextXAlignment="Left"
				TextYAlignment="Center"
				Position={px(INNER_PAD, 0)}
				Size={new UDim2(1, -(INNER_PAD + 72), 0, HEADER_HEIGHT)}
				BackgroundTransparency={1}
			/>

			<Canvas size={px(40, 40)} position={new UDim2(1, -56, 0, 16)}>
				<Fill color={headerToggleFill} radius={10} />
				<Border color={headerToggleStroke} radius={10} transparency={useSpring(showForm ? 0.35 : 0.45, {})} />
				{showForm ? (
					<imagelabel
						Image={SCRIPT_ICON_CROSS}
						ImageColor3={theme.foreground}
						ScaleType={Enum.ScaleType.Fit}
						BackgroundTransparency={1}
						AnchorPoint={new Vector2(0.5, 0.5)}
						Position={scale(0.5, 0.5)}
						Size={px(ICON_INSET_40, ICON_INSET_40)}
					/>
				) : (
					<imagelabel
						Image={SCRIPT_ICON_PLUS}
						ImageColor3={theme.foreground}
						ScaleType={Enum.ScaleType.Fit}
						BackgroundTransparency={1}
						AnchorPoint={new Vector2(0.5, 0.5)}
						Position={scale(0.5, 0.5)}
						Size={px(ICON_INSET_40, ICON_INSET_40)}
					/>
				)}
				<textbutton
					Text=""
					AutoButtonColor={false}
					Size={scale(1, 1)}
					BackgroundTransparency={1}
					Event={{
						Activated: () => (showForm ? closeForm() : openNewForm()),
						MouseEnter: () => setAddHover(true),
						MouseLeave: () => setAddHover(false),
					}}
				/>
			</Canvas>

			<frame
				Size={new UDim2(1, -(INNER_PAD * 2), 0, 1)}
				Position={px(INNER_PAD, HEADER_HEIGHT)}
				BackgroundColor3={hairline}
				BackgroundTransparency={theme.outlined ? 0.78 : 0.88}
				BorderSizePixel={0}
			/>

			<Canvas
				size={formBlockH.map((h) => new UDim2(1, 0, 0, h))}
				position={px(0, HEADER_HEIGHT + 1)}
				clipsDescendants
			>
				<Canvas
					size={new UDim2(1, 0, 0, FORM_HEIGHT)}
					position={px(0, 0)}
					padding={{ left: INNER_PAD, right: INNER_PAD, top: 14, bottom: 14 }}
				>
					<frame
						Size={new UDim2(1, 0, 0, 38)}
						Position={px(0, 0)}
						BackgroundColor3={inputBg}
						BackgroundTransparency={0}
						BorderSizePixel={0}
					>
						<uicorner CornerRadius={new UDim(0, 8)} />
						{theme.button.outlined && (
							<Border color={theme.button.foreground} radius={8} transparency={0.35} />
						)}
						<textbox
							Text={nameText}
							PlaceholderText="Script name"
							PlaceholderColor3={mutedFg.Lerp(theme.background, 0.35)}
							Font="Gotham"
							TextSize={15}
							TextColor3={theme.foreground}
							TextXAlignment="Left"
							TextYAlignment="Center"
							ClearTextOnFocus={false}
							Position={px(12, 0)}
							Size={new UDim2(1, -24, 1, 0)}
							BackgroundTransparency={1}
							BorderSizePixel={0}
							Change={{
								Text: (rbx) => {
									setNameText(rbx.Text);
								},
							}}
						/>
					</frame>

					<frame
						Size={new UDim2(1, 0, 0, 196)}
						Position={px(0, 46)}
						BackgroundColor3={inputBg}
						BackgroundTransparency={0}
						BorderSizePixel={0}
						ClipsDescendants={true}
					>
						<uicorner CornerRadius={new UDim(0, 8)} />
						{theme.button.outlined && (
							<Border color={theme.button.foreground} radius={8} transparency={0.35} />
						)}
						<textbox
							Text={codeText}
							PlaceholderText={'-- paste or write your Lua script here\nprint("Hello from Orca!")'}
							PlaceholderColor3={mutedFg.Lerp(theme.background, 0.35)}
							Font="Code"
							TextSize={13}
							TextColor3={theme.foreground}
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
									setCodeText(rbx.Text);
								},
							}}
						/>
					</frame>

					<Canvas size={new UDim2(1, 0, 0, 38)} position={px(0, 250)}>
						<Fill color={saveFill} radius={8} transparency={0.12} />
						<Border color={saveAccent} radius={8} transparency={useSpring(saveHover ? 0.35 : 0.55, {})} />
						<textlabel
							Text={editingScriptId !== undefined ? "Save changes" : "Save script"}
							Font="GothamBold"
							TextSize={15}
							TextColor3={saveLabelColor}
							TextXAlignment="Center"
							TextYAlignment="Center"
							Size={scale(1, 1)}
							BackgroundTransparency={1}
						/>
						<textbutton
							Text=""
							AutoButtonColor={false}
							Size={scale(1, 1)}
							BackgroundTransparency={1}
							Event={{
								Activated: () => handleSave(),
								MouseEnter: () => setSaveHover(true),
								MouseLeave: () => setSaveHover(false),
							}}
						/>
					</Canvas>
				</Canvas>

				<frame
					Size={new UDim2(1, -(INNER_PAD * 2), 0, 1)}
					Position={px(INNER_PAD, FORM_HEIGHT)}
					BackgroundColor3={hairline}
					BackgroundTransparency={theme.outlined ? 0.78 : 0.88}
					BorderSizePixel={0}
				/>
			</Canvas>

			<Canvas
				size={listTopBinding.map((top) => new UDim2(1, 0, 1, -top))}
				position={listTopBinding.map((top) => new UDim2(0, 0, 0, top))}
				clipsDescendants
			>
				<scrollingframe
					Size={scale(1, 1)}
					CanvasSize={scrollCanvasH.map((h) => new UDim2(0, 0, 0, h))}
					BackgroundTransparency={1}
					BorderSizePixel={0}
					ScrollBarImageTransparency={0.65}
					ScrollBarThickness={4}
					ScrollBarImageColor3={hairline}
					ScrollingDirection="Y"
				>
					{scripts.size() === 0 && (
						<textlabel
							Text={"No scripts yet\nClick  +  to add your first script"}
							Font="Gotham"
							TextSize={15}
							TextColor3={mutedFg}
							TextTransparency={0.35}
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
							theme={theme}
							name={entry.name}
							index={i}
							isExiting={exitingScriptId === entry.id}
							onRun={() => runUserScript(entry.code, entry.name)}
							onEdit={() => openEditForm(entry)}
							onDelete={() => scheduleDelete(entry)}
						/>
					))}
				</scrollingframe>
			</Canvas>
		</Canvas>
	);
}

export default hooked(ScriptManager);
