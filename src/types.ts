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
	 * Register a callback to be called when the chat widget is opened.
	 * The callback is triggered every time the chat opens, whether by user click
	 * or programmatically via `open()` or `toggle()`.
	 * 
	 * @param callback - Function to call when the chat opens
	 * 
	 * @example
	 * HEYO.onOpen(() => {
	 *   analytics.track('chat_opened');
	 * });
	 */
	onOpen(callback: () => void): void;
	/**
	 * Register a callback to be called when the chat widget is closed.
	 * The callback is triggered every time the chat closes, whether by user click
	 * or programmatically via `close()` or `toggle()`.
	 * 
	 * @param callback - Function to call when the chat closes
	 * 
	 * @example
	 * HEYO.onClose(() => {
	 *   analytics.track('chat_closed');
	 * });
	 */
	onClose(callback: () => void): void;
	/**
	 * Flag becomes true once the widget finished booting.
	 */
	readonly ready: boolean;
	/**
	 * Log out the current visitor and clear their session.
	 * Useful when your user logs out of your app.
	 * 
	 * @example
	 * // When user logs out of your app
	 * HEYO.logout();
	 */
	logout(): void;
	/**
	 * Add a tag to the current visitor.
	 * Tags can be used to categorize visitors (e.g., 'vip', 'paid-user', 'trial').
	 * 
	 * @param tag - The tag to add
	 * 
	 * @example
	 * HEYO.addTag('premium-user');
	 * HEYO.addTag('onboarding-complete');
	 */
	addTag(tag: string): void;
	/**
	 * Remove a tag from the current visitor.
	 * 
	 * @param tag - The tag to remove
	 * 
	 * @example
	 * HEYO.removeTag('trial-user');
	 */
	removeTag(tag: string): void;
	/**
	 * Set all tags for the current visitor, replacing any existing tags.
	 * 
	 * @param tags - Array of tags to set
	 * 
	 * @example
	 * HEYO.setTags(['vip', 'paid-user', 'active']);
	 */
	setTags(tags: string[]): void;
	/**
	 * Set a custom field on the current visitor.
	 * Custom fields can store any metadata about your visitors (e.g., plan type, signup date, etc.).
	 * 
	 * @param key - The field name (alphanumeric, dots, dashes, and underscores allowed)
	 * @param value - The field value (string, number, or boolean)
	 * 
	 * @example
	 * HEYO.setField('plan', 'premium');
	 * HEYO.setField('signupDate', '2025-01-15');
	 * HEYO.setField('isSubscribed', true);
	 */
	setField(key: string, value: string | number | boolean): void;
	/**
	 * Remove a custom field from the current visitor.
	 * 
	 * @param key - The field name to remove
	 * 
	 * @example
	 * HEYO.removeField('tempData');
	 */
	removeField(key: string): void;
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
