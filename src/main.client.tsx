import Make from "@rbxts/make";
import Roact from "@rbxts/roact";
import { Provider } from "@rbxts/roact-rodux-hooked";
import { Players } from "@rbxts/services";
import { IS_DEV } from "constants";
import { setStore, trackCleanup } from "jobs";
import { toggleDashboard } from "store/actions/dashboard.action";
import { configureStore } from "store/store";
import App from "./App";

const store = configureStore();
setStore(store);

/**
 * Renders the app to the screen. Protects it if possible.
 * TODO: Roact portals are a better way to do this?
 */
function render(app: ScreenGui) {
	const protect = syn ? syn.protect_gui : protect_gui;
	if (protect) {
		protect(app);
	}

	if (IS_DEV) {
		app.Parent = Players.LocalPlayer.WaitForChild("PlayerGui");
	} else if (gethui) {
		app.Parent = gethui();
	} else {
		app.Parent = game.GetService("CoreGui");
	}
}

async function main() {
	if (getgenv) {
		const g = getgenv() as Record<string, unknown>;

		// Clean up any previous instance before remounting
		if (g._ORCA_TREE !== undefined) {
			pcall(() => Roact.unmount(g._ORCA_TREE as Roact.Tree));
			g._ORCA_TREE = undefined;
		}
		if (g._ORCA_APP !== undefined) {
			pcall(() => (g._ORCA_APP as ScreenGui).Destroy());
			g._ORCA_APP = undefined;
		}
		g._ORCA_IS_LOADED = undefined;
	}

	const container = Make("Folder", {});
	const tree = Roact.mount(
		<Provider store={store}>
			<App />
		</Provider>,
		container,
	);
	const app = container.WaitForChild(1) as ScreenGui;
	app.Name = "Orca";
	render(app);

	trackCleanup(() => {
		pcall(() => Roact.unmount(tree));
		pcall(() => app.Destroy());

		if (getgenv) {
			const g = getgenv() as Record<string, unknown>;
			if (g._ORCA_TREE === tree) {
				g._ORCA_TREE = undefined;
			}
			if (g._ORCA_APP === app) {
				g._ORCA_APP = undefined;
			}
			g._ORCA_IS_LOADED = undefined;
		}
	});

	if (getgenv) {
		const g = getgenv() as Record<string, unknown>;
		g._ORCA_IS_LOADED = true;
		g._ORCA_TREE = tree;
		g._ORCA_APP = app;
	}

	// If 3 seconds passed since the game started, show the dashboard
	if (time() > 3) {
		task.defer(() => store.dispatch(toggleDashboard()));
	}
}

main().catch((err) => {
	warn(`Orca failed to load: ${err}`);
});
