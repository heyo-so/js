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

/**
 * The possible agent status values.
 */
export type HeyoAgentStatus = 'online' | 'away' | 'offline';

export type HeyoAPI = {
	/**
	 * Internal flag indicating whether the widget is ready.
	 * @internal
	 */
	_ready: boolean;
	/**
	 * Show the HEYO widget.
	 * @param options - Optional parameters
	 * @param options.force - Force show even if hideWhenOffline is enabled and agents are offline
	 */
	show(options?: { force?: boolean }): void;
	/**
	 * Hide the HEYO widget.
	 */
	hide(): void;
	/**
	 * Open the HEYO widget
	 * @param options - Optional parameters
	 * @param options.force - Force open even if hideWhenOffline is enabled and agents are offline
	 */
	open(options?: { force?: boolean }): void;
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
	 * Get the current agent status.
	 * @returns 'online', 'away', or 'offline'
	 * 
	 * @example
	 * const status = HEYO.getAgentStatus();
	 * if (status === 'online') {
	 *   showLiveChatButton();
	 * } else {
	 *   showContactForm();
	 * }
	 */
	getAgentStatus(): HeyoAgentStatus;
	/**
	 * Register a callback to be notified when the agent status changes.
	 * The callback is called immediately with the current status when registered.
	 * Multiple callbacks can be registered and they will all be called on status changes.
	 * 
	 * @param callback - Function to call when status changes
	 * 
	 * @example
	 * HEYO.onAgentStatusChange((status) => {
	 *   console.log('Agent is now:', status);
	 *   updateUIBasedOnStatus(status);
	 * });
	 */
	onAgentStatusChange(callback: (status: HeyoAgentStatus) => void): void;
	/**
	 * Register a callback to be called when the HEYO widget is fully ready.
	 * If the widget is already ready, the callback is called immediately.
	 * Otherwise, it's queued and called once the widget finishes initializing.
	 * 
	 * @param callback - Function to call when the widget is ready
	 * 
	 * @example
	 * HEYO.onReady(() => {
	 *   console.log('HEYO widget is ready!');
	 *   // Safe to call other HEYO methods here
	 *   HEYO.identify({ userId: '123' });
	 * });
	 */
	onReady(callback: () => void): void;
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
