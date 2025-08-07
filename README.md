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

```ts
import { HEYO } from "@heyo.so/js";

// Use HEYO.init() to load the widget. You can optionally pass options (see below)
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

| Option    | Type       | Default                        | Description                                              |
| --------- | ---------- | ------------------------------ | -------------------------------------------------------- |
| projectId | `string?`  | –                              | Your HEYO project ID. Required for localhost development |
| hidden    | `boolean?` | `false`                        | Start with the widget fully hidden                       |

Example:

```ts
HEYO.init({
	projectId: "abc123",
	hidden: true,
});
```

---

## API (`HeyoAPI`)

| Method                            | Description                             |
| --------------------------------- | --------------------------------------- |
| `show()`                          | Reveal the floating button / agent card |
| `hide()`                          | Completely hide the widget              |
| `open()`                          | Open the chat panel                     |
| `close()`                         | Close the chat panel                    |
| `identify(meta)`                  | Pass user metadata (ID, email, name…)   |
| `ready` <small>(property)</small> | `true` when the widget is fully loaded  |

All methods are **no-ops until the widget is ready**, but thanks to the internal queue you can call them at any time.

---

## Framework Recipes

### React / Next.js (Client Component)

```tsx
"use client";
import { useEffect } from "react";
import { HEYO } from "@heyo.so/js";

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
import { HEYO } from "@heyo.so/js";

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
export interface HeyoAPI {
	show(): void;
	hide(): void;
	open(): void;
	close(): void;
	identify(meta: HeyoIdentifyMeta): void;
	readonly ready: boolean;
}

export interface HeyoGlobal extends HeyoAPI {
	init(opts?: HeyoConfig): Promise<HeyoAPI>;
}
```

---

## Contributing

1. `git clone` this repo & `cd` into it
2. `npm i`
3. `npm run build` to generate `dist/`
4. Link locally with `npm link` then `npm link @heyo.so/js` in a test project

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

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
