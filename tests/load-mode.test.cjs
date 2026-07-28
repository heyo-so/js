const assert = require('node:assert/strict');
const test = require('node:test');

function loadSdkFresh() {
    const modulePath = require.resolve('../dist/index.js');
    delete require.cache[modulePath];
    return require(modulePath);
}

function createBrowserHarness({ readyState = 'loading' } = {}) {
    let injectedScript;
    let loadHandler;
    let idleHandler;

    global.window = {
        location: { hostname: 'example.com' },
        addEventListener(event, handler) {
            if (event === 'load') loadHandler = handler;
        },
        requestIdleCallback(handler) {
            idleHandler = handler;
        },
        setTimeout,
    };
    global.document = {
        readyState,
        createElement(tagName) {
            assert.equal(tagName, 'script');
            return {};
        },
        head: {
            appendChild(script) {
                injectedScript = script;
            },
        },
    };

    return {
        getInjectedScript: () => injectedScript,
        releasePageLoad: () => loadHandler?.(),
        releaseBrowserIdle: () => idleHandler?.(),
    };
}

test('lazy mode injects no HEYO script until host load and browser idle', async () => {
    const harness = createBrowserHarness();
    const { HEYO } = loadSdkFresh();

    const initialization = HEYO.init({
        projectId: '0123456789abcdef01234567',
        loadMode: 'lazy',
        widgetStyle: 'agent-card',
        widgetPosition: 'left',
        widgetSize: 'small',
        widgetColor: '#123456',
        scriptSrc: 'https://heyo.test/embed/script',
    });

    assert.equal(harness.getInjectedScript(), undefined);
    harness.releasePageLoad();
    assert.equal(harness.getInjectedScript(), undefined);
    harness.releaseBrowserIdle();

    const injectedScript = harness.getInjectedScript();
    assert.ok(injectedScript);
    const scriptUrl = new URL(injectedScript.src);
    assert.equal(scriptUrl.searchParams.get('loadMode'), 'lazy');
    assert.equal(scriptUrl.searchParams.get('widgetStyle'), 'agent-card');
    assert.equal(scriptUrl.searchParams.get('widgetPosition'), 'left');
    assert.equal(scriptUrl.searchParams.get('widgetSize'), 'small');
    assert.equal(scriptUrl.searchParams.get('widgetColor'), '#123456');

    window.HEYO = {};
    injectedScript.onload();
    await initialization;
});

test('an API call before host load starts a lazy loader immediately', async () => {
    const harness = createBrowserHarness();
    const { HEYO } = loadSdkFresh();
    let opens = 0;

    const initialization = HEYO.init({
        projectId: '0123456789abcdef01234567',
        loadMode: 'lazy',
        scriptSrc: 'https://heyo.test/embed/script',
    });

    HEYO.open();

    const injectedScript = harness.getInjectedScript();
    assert.ok(injectedScript);
    window.HEYO = {
        open() {
            opens += 1;
        },
    };
    injectedScript.onload();

    await initialization;
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.equal(opens, 1);
});

test('an immediate status read starts lazy loading and replays after the API is ready', async () => {
    const harness = createBrowserHarness();
    const { HEYO } = loadSdkFresh();
    let statusReads = 0;

    const initialization = HEYO.init({
        projectId: '0123456789abcdef01234567',
        loadMode: 'lazy',
        scriptSrc: 'https://heyo.test/embed/script',
    });

    assert.equal(HEYO.getAgentStatus(), 'offline');

    const injectedScript = harness.getInjectedScript();
    assert.ok(injectedScript);
    window.HEYO = {
        getAgentStatus() {
            statusReads += 1;
            return 'online';
        },
    };
    injectedScript.onload();

    await initialization;
    await new Promise((resolve) => setTimeout(resolve, 150));
    assert.equal(statusReads, 1);
});

test('eager mode injects the HEYO script immediately', async () => {
    const harness = createBrowserHarness();
    const { HEYO } = loadSdkFresh();

    const initialization = HEYO.init({
        projectId: '0123456789abcdef01234567',
        loadMode: 'eager',
        scriptSrc: 'https://heyo.test/embed/script',
    });

    const injectedScript = harness.getInjectedScript();
    assert.ok(injectedScript);
    assert.equal(new URL(injectedScript.src).searchParams.get('loadMode'), 'eager');

    window.HEYO = {};
    injectedScript.onload();
    await initialization;
});
