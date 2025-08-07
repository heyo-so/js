export type HeyoConfig = {
	/**
	 * You can optionally specify your `projectId` (required for localhost development).
	 */
	projectId?: string;
	/**
	 * Specify if the widget should be hidden by default. Default is `false`.
	 */
	hidden?: boolean;
	/**
	 * Use a different URL to load the script, for dev purposes only.
	 */
	scriptSrc?: string;
};

export type HeyoAPI = {
	/**
	 * Show the HEYO widget.
	 */
	show(): void;
	/**
	 * Hide the HEYO widget.
	 */
	hide(): void;
	/**
	 * Open the HEYO widget
	 */
	open(): void;
	/**
	 * Close the HEYO widget.
	 */
	close(): void;
	/**
	 * Identify the user using an email or your internal user ID. Can also pass a name to show in the dashboard.
	 *
	 * `meta.userId` -> Your internal user ID.
	 *
	 * `meta.email` -> The user's email address.
	 *
	 * `meta.name` -> The user's name.
	 */
	identify(meta: HeyoIdentifyMeta): void;
	/**
	 * Flag becomes true once the widget finished booting.
	 */
	readonly ready: boolean;
};

export type HeyoGlobal = HeyoAPI & {
	/**
	 * Programmatically load the HEYO widget. Returns the same API once ready.
	 */
	init(opts?: HeyoConfig): Promise<HeyoAPI>;
};

export type HeyoIdentifyMeta = {
	userId?: string;
	email?: string;
	name?: string;
};

// -- internal ---------------------------------------------------------
declare global {
	interface Window {
		HEYO?: HeyoGlobal;
	}
}
