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
	/**
	 * Control the verbosity of console logs output by the widget script.
	 * - 'debug'   → detailed debug information
	 * - 'minimal' → only essential information (default)
	 * - 'none'    → suppress all logs
	 */
	logs?: HeyoLogLevel;
};

/**
 * The verbosity level for console logs emitted by the widget script.
 */
export type HeyoLogLevel = 'debug' | 'minimal' | 'none';

export type HeyoWidgetSettings = {
	/**
	 * The color of the widget button/card. Accepts hex color values.
	 */
	widgetColor?: string;
	/**
	 * The style of the widget.
	 */
	widgetStyle?: 'bubble' | 'agent-card';
	/**
	 * The position of the widget on the screen.
	 */
	widgetPosition?: 'left' | 'right';
	/**
	 * The size of the widget.
	 */
	widgetSize?: 'small' | 'medium' | 'large';
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
	 * Toggle the HEYO widget open/closed.
	 */
	toggle(): void;
	/**
	 * Check if the HEYO widget is currently open.
	 * @returns true if the widget is open, false otherwise
	 */
	isOpen(): boolean;
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
	 * Dynamically configure the widget appearance. 
	 * This allows you to change the widget style, position, size, and color at runtime.
	 * Useful for having different widget configurations on different pages.
	 * 
	 * @example
	 * // Show as agent card on landing page
	 * HEYO.configure({ 
	 *   widgetStyle: 'agent-card', 
	 *   widgetPosition: 'right',
	 *   widgetSize: 'medium',
	 *   widgetColor: '#10b981'
	 * });
	 * 
	 * // Show as minimal bubble in dashboard
	 * HEYO.configure({ 
	 *   widgetStyle: 'bubble', 
	 *   widgetSize: 'small' 
	 * });
	 */
	configure(settings: HeyoWidgetSettings): void;
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
