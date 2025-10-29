# Heyo JS &nbsp; <img src="https://heyo.so/favicon.ico" alt="Heyo logo" height="22"/>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Bundle size][bundle-src]][bundle-href]

**HEYO JS** is the official _JavaScript_ SDK that loads the [HEYO](https://heyo.so?utm_source=npm&utm_campaign=heyo-js) live-chat widget and exposes a tiny, typed API.

_One line to install, one line to open a chat._

```bash
npm i @heyo.so/js
```

---

## Features

-   ⚡ **Zero-config** – drop‐in, no manual `<script>` tags required
-   🪶 **Tiny** – <1 kB gzipped, defers the heavy widget to the CDN
-   🧩 **Framework-agnostic** – works in React, Vue, Svelte, vanilla HTML…
-   🕰 **Race-condition-proof** – call `HEYO.open()` _before_ or _after_ the widget loads; the SDK queues and replays for you
-   📜 **First-class TypeScript** – autocompletion for every method

---

## Quick Start

### 1 · Import once on the client

You can use either named or default import:

```ts
// Named import
import { HEYO } from "@heyo.so/js";

// OR default import
import HEYO from "@heyo.so/js";

// Both work identically! Use HEYO.init() to load the widget
HEYO.init({
	projectId: "YOUR_PROJECT_ID", // optional in production, required on localhost
});
```

### 2 · Use the API anywhere

```ts
HEYO.open(); // open the chat drawer
HEYO.identify({
	userId: "42",
	email: "jane@example.com",
	name: "Jane Doe",
});
```

`HEYO` is a global singleton: import it once, use it everywhere, even in the browser console.

---

## Configuration (`HeyoConfig`)

| Option    | Type                             | Default     | Description                                              |
| --------- | -------------------------------- | ----------- | -------------------------------------------------------- |
| projectId | `string?`                        | –           | Your HEYO project ID. Required for localhost development |
| hidden    | `boolean?`                       | `false`     | Start with the widget fully hidden                       |
| logs      | `'debug' \| 'minimal' \| 'none'` | `'minimal'` | Control console log verbosity                            |

Example:

```ts
HEYO.init({
	projectId: "abc123",
	hidden: true,
	logs: "debug",
});
```

---

## API (`HeyoAPI`)

| Method                                    | Description                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------- |
| `show(options?)`                          | Reveal the floating button / agent card. Use `{ force: true }` to override hideWhenOffline |
| `hide()`                                  | Completely hide the widget                                                |
| `open(options?)`                          | Open the chat panel. Use `{ force: true }` to override hideWhenOffline    |
| `close()`                                 | Close the chat panel                                                      |
| `toggle()`                                | Toggle the chat panel open/closed                                         |
| `isOpen()`                                | Returns `true` if the chat panel is currently open                        |
| `identify(meta)`                          | Pass user metadata (ID, email, name…)                                     |
| `configure(settings)`                     | Dynamically change widget appearance (style, position, size, color)       |
| `getAgentStatus()`                        | Returns current agent status: `'online'`, `'away'`, or `'offline'`        |
| `onAgentStatusChange(callback)`           | Register a callback for when agent status changes                         |
| `onReady(callback)`                       | Register a callback for when the widget is fully loaded and ready         |
| `ready` <small>(property)</small>         | `true` when the widget is fully loaded                                    |

All methods are **no-ops until the widget is ready**, but thanks to the internal queue you can call them at any time.

### Examples

#### Dynamic Configuration

Change the widget appearance on different pages:

```ts
// Landing page - show agent card
HEYO.configure({
	widgetStyle: "agent-card",
	widgetPosition: "right",
	widgetSize: "medium",
	widgetColor: "#10b981",
});

// Dashboard - show minimal bubble
HEYO.configure({
	widgetStyle: "bubble",
	widgetSize: "small",
	widgetColor: "#6366f1",
});
```

#### Agent Status

React to agent availability:

```ts
HEYO.onAgentStatusChange((status) => {
	if (status === "online") {
		console.log("Agents are online!");
	} else if (status === "away") {
		console.log("Agents are away");
	} else {
		console.log("All agents are offline");
	}
});

// Or check status directly
const status = HEYO.getAgentStatus();
```

#### Wait for Widget to be Ready

Execute code when the widget is fully initialized:

```ts
HEYO.onReady(() => {
	console.log("Widget is ready!");
	HEYO.identify({ userId: "123", email: "user@example.com" });
});
```

---

## Framework Recipes

### React / Next.js (Client Component)

```tsx
"use client";
import { useEffect } from "react";
import HEYO from "@heyo.so/js"; // or: import { HEYO } from "@heyo.so/js"

export default function Page() {
	useEffect(() => {
		HEYO.init({ projectId: "YOUR_PROJECT_ID" });
	}, []);

	return <button onClick={() => HEYO.open()}>Chat with us</button>;
}
```

### Nuxt 3 (plugin)

```ts
// plugins/heyo.client.ts
import { defineNuxtPlugin } from "#app";
import HEYO from "@heyo.so/js"; // or: import { HEYO } from "@heyo.so/js"

export default defineNuxtPlugin(() => {
	HEYO.init({ projectId: "YOUR_PROJECT_ID" });
	return {
		provide: { heyo: HEYO },
	};
});
```

In components you can now use `const { $heyo } = useNuxtApp()`.

---

## Type Definitions

The SDK is written in TypeScript and ships its `.d.ts` files. Quick peek:

```ts
export type HeyoAgentStatus = 'online' | 'away' | 'offline';

export interface HeyoAPI {
	show(options?: { force?: boolean }): void;
	hide(): void;
	open(options?: { force?: boolean }): void;
	close(): void;
	toggle(): void;
	isOpen(): boolean;
	identify(meta: HeyoIdentifyMeta): void;
	configure(settings: HeyoWidgetSettings): void;
	getAgentStatus(): HeyoAgentStatus;
	onAgentStatusChange(callback: (status: HeyoAgentStatus) => void): void;
	onReady(callback: () => void): void;
	readonly ready: boolean;
}

export interface HeyoGlobal extends HeyoAPI {
	init(opts?: HeyoConfig): Promise<HeyoAPI>;
}

export interface HeyoWidgetSettings {
	widgetColor?: string;
	widgetStyle?: 'bubble' | 'agent-card';
	widgetPosition?: 'left' | 'right';
	widgetSize?: 'small' | 'medium' | 'large';
}

export interface HeyoIdentifyMeta {
	userId?: string;
	email?: string;
	name?: string;
}
```

## License

[MIT](./LICENSE)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@heyo.so/js/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@heyo.so/js
[npm-downloads-src]: https://img.shields.io/npm/dm/@heyo.so/js.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@heyo.so/js
[license-src]: https://img.shields.io/npm/l/@heyo.so/js.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@heyo.so/js
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@heyo.so/js?color=00DC82&label=gzip%20size
[bundle-href]: https://bundlephobia.com/package/@heyo.so/js
