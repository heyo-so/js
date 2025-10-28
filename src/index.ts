export * from './types';

// src/index.ts
import type { HeyoConfig, HeyoAPI } from './types';

let loaderPromise: Promise<HeyoAPI> | null = null;

function injectScript(src: string): Promise<HeyoAPI> {
    return new Promise((resolve, reject) => {
        // If HEYO already exists, just use it
        if (window.HEYO) return resolve(window.HEYO);

        const script = document.createElement('script');
        script.async = true;
        script.src = src;
        script.onerror = (ev) => {
            console.error(ev);
            reject(new Error(`Failed to load HEYO script: ${ev.toString()}`));
        };
        script.onload = () => {
            // Wait for HEYO to attach to window
            setTimeout(() => {
                if (window.HEYO) resolve(window.HEYO);
                else reject(new Error('HEYO did not attach to window'));
            }, 100);
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
    if (typeof window === 'undefined') return Promise.resolve({} as HeyoAPI); // SSR Guard

    // If HEYO already exists, just return it
    if (window.HEYO) return Promise.resolve(window.HEYO);

    // If already loading, return the existing promise
    if (loaderPromise) return loaderPromise;

    const isLocalhost = window.location.hostname === 'localhost';

    if (isLocalhost) console.log(`💬 [HEYO DEV] Loading HEYO script with options:`, opts);

    const url = new URL(opts.scriptSrc ?? 'https://heyo.so/embed/script');
    if (opts.projectId) url.searchParams.set('projectId', opts.projectId);
    if (opts.hidden) url.searchParams.set('hidden', 'true');
    if (opts.logs) url.searchParams.set('logs', opts.logs);

    loaderPromise = injectScript(url.toString());
    return loaderPromise;
}

// Simple alias so callers can do `HEYO.init(...)` if they prefer
export const init = loadHeyo;

// ------------------------------------------------------------------
// Provide a typed `HEYO` proxy that queues calls until the real widget is ready
// ------------------------------------------------------------------
import type { HeyoGlobal } from './types';

async function waitForMethod(methodName: string): Promise<HeyoAPI> {
    // First ensure the basic HEYO object exists
    await loadHeyo();

    // Check if method is already available
    if (window.HEYO && typeof (window.HEYO as Record<string, unknown>)[methodName] === 'function') {
        return window.HEYO;
    }

    // Now wait for the specific method to be available
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max wait

        // console.log(`[HEYO] Waiting for method '${methodName}' to become available...`);

        const checkMethod = () => {
            if (window.HEYO && typeof (window.HEYO as Record<string, unknown>)[methodName] === 'function') {
                console.log(`[HEYO] Method '${methodName}' is now available`);
                resolve(window.HEYO);
            } else if (attempts < maxAttempts) {
                attempts++;
                setTimeout(checkMethod, 100);
            } else {
                const availableMethods = window.HEYO ? Object.keys(window.HEYO).filter((k) => typeof (window.HEYO as Record<string, unknown>)[k] === 'function') : [];
                reject(new Error(`[HEYO] Method '${methodName}' not available after 5 seconds. Available methods: ${availableMethods.join(', ')}`));
            }
        };

        setTimeout(checkMethod, 100); // Start checking after a small delay
    });
}

export const HEYO: HeyoGlobal = new Proxy({} as HeyoGlobal, {
    get(_t, prop: PropertyKey) {
        // Return the init shortcut directly so users can call HEYO.init()
        if (prop === 'init') return init;

        if (typeof window === 'undefined') return () => {}; // SSR Guard

        // For the '_ready' flag, check directly on window.HEYO
        if (prop === '_ready') {
            return window.HEYO?._ready ?? false;
        }

        // For the 'ready' property, check if window.HEYO exists with identify method
        // The identify method is only available when the widget is fully ready
        if (prop === 'ready') {
            return !!(window.HEYO && typeof window.HEYO.identify === 'function');
        }

        // For isOpen, we need to call it synchronously and return the result
        // This is a special case since it returns a boolean value immediately
        if (prop === 'isOpen') {
            return () => {
                // If window.HEYO exists and has isOpen, call it
                if (window.HEYO && typeof window.HEYO.isOpen === 'function') {
                    return window.HEYO.isOpen();
                }
                // Default to false if not ready
                return false;
            };
        }

        // For getAgentStatus, we need to call it synchronously and return the result
        // This is a special case since it returns a status value immediately
        if (prop === 'getAgentStatus') {
            return () => {
                // If window.HEYO exists and has getAgentStatus, call it
                if (window.HEYO && typeof window.HEYO.getAgentStatus === 'function') {
                    return window.HEYO.getAgentStatus();
                }
                // Default to 'offline' if not ready
                return 'offline';
            };
        }

        // All other property accesses are treated as async calls to the real API
        return (...args: unknown[]) => {
            const methodName = String(prop);

            // Wait for the specific method to be available
            waitForMethod(methodName)
                .then((api) => {
                    const apiRecord = api as Record<string, unknown>;
                    const fn = apiRecord[methodName];
                    if (typeof fn === 'function') {
                        fn.apply(api, args);
                    }
                })
                .catch((error) => {
                    console.error(error.message);
                });
        };
    },
}) as HeyoGlobal;

export default HEYO;
