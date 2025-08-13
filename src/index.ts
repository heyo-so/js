export * from "./types";

// src/index.ts
import type { HeyoConfig, HeyoAPI } from "./types";

let loaderPromise: Promise<HeyoAPI> | null = null;

function injectScript(src: string): Promise<HeyoAPI> {
	return new Promise((resolve, reject) => {
		if (window.HEYO?.ready) return resolve(window.HEYO);

		const script = document.createElement("script");
		script.async = true;
		script.src = src;
		script.onerror = (ev) => {
			console.error(ev);
			reject(new Error(`Failed to load HEYO script: ${ev.toString()}`));
		};
		script.onload = () => {
			if (window.HEYO) resolve(window.HEYO);
			else reject(new Error("HEYO did not attach to window"));
		};
		document.head.appendChild(script);
	});
}

// -- public -----------------------------------------------------------

/**
 * Load and initialize the HEYO script with the selected options.
 *
 * @param opts - The options to use when loading the HEYO script.
 * @returns The HEYO API.
 */
export async function loadHeyo(opts: HeyoConfig = {}): Promise<HeyoAPI> {
	if (window.HEYO?.ready) return window.HEYO;
	if (loaderPromise) return loaderPromise;

	const isLocalhost = window.location.hostname === "localhost";

	if (isLocalhost)
		console.log(`💬 [HEYO DEV] Loading HEYO script with options:`, opts);

	const url = new URL(opts.scriptSrc ?? "https://heyo.so/embed/script");
	if (opts.projectId) url.searchParams.set("projectId", opts.projectId);
	if (opts.hidden) url.searchParams.set("hidden", "true");

	loaderPromise = injectScript(url.toString());
	return loaderPromise;
}

// Simple alias so callers can do `HEYO.init(...)` if they prefer
export const init = loadHeyo;

// ------------------------------------------------------------------
// Provide a typed `HEYO` proxy that queues calls until the real widget is ready
// ------------------------------------------------------------------
import type { HeyoGlobal } from "./types";

function getRealApi() {
	// `loadHeyo` handles singleton injection & memoisation
	return loadHeyo() as Promise<HeyoAPI>;
}

export const HEYO: HeyoGlobal = new Proxy({} as HeyoGlobal, {
	get(_t, prop: PropertyKey) {
		// Return the init shortcut directly so users can call HEYO.init()
		if (prop === "init") return init;

		// All other property accesses are treated as async calls to the real API
		return (...args: any[]) => {
			getRealApi().then((api: any) => {
				const fn = api[prop as keyof HeyoAPI];
				if (typeof fn === "function") fn.apply(api, args);
			});
		};
	},
}) as HeyoGlobal;
