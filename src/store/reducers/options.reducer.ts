import Rodux from "@rbxts/rodux";
import { OptionsAction } from "store/actions/options.action";
import { OptionsState } from "store/models/options.model";
import { persistentState } from "store/persistent-state";

const defaultShortcuts: OptionsState["shortcuts"] = {
	toggleDashboard: Enum.KeyCode.K.Value,
};

const loaded = persistentState<OptionsState>("options", (state) => state.options, {
	currentTheme: "Sorbet",
	config: {
		acrylicBlur: true,
	},
	shortcuts: defaultShortcuts,
});

// Build merged shortcuts: start from defaults, then overwrite with any saved
// values. This ensures keys added after a save file was written get their
// default rather than showing as "Not bound".
const mergedShortcuts = { ...defaultShortcuts } as OptionsState["shortcuts"];
for (const [k, v] of pairs(loaded.shortcuts as Record<string, number>)) {
	if (v !== undefined) {
		(mergedShortcuts as Record<string, number>)[k] = v;
	}
}

const initialState: OptionsState = {
	...loaded,
	shortcuts: mergedShortcuts,
};

export const optionsReducer = Rodux.createReducer<OptionsState, OptionsAction>(initialState, {
	"options/setConfig": (state, action) => {
		return {
			...state,
			config: {
				...state.config,
				[action.name]: action.active,
			},
		};
	},
	"options/setTheme": (state, action) => {
		return {
			...state,
			currentTheme: action.theme,
		};
	},
	"options/setShortcut": (state, action) => {
		return {
			...state,
			shortcuts: {
				...state.shortcuts,
				[action.shortcut]: action.keycode,
			},
		};
	},
	"options/removeShortcut": (state, action) => {
		return {
			...state,
			shortcuts: {
				...state.shortcuts,
				[action.shortcut]: undefined,
			},
		};
	},
});
