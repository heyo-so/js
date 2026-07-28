const assert = require('node:assert/strict');
const test = require('node:test');

test('an immediate status read reaches the embed API after init while returning offline synchronously', async () => {
    let injectedScript;
    let statusReads = 0;

    global.window = {
        location: { hostname: 'example.com' },
    };
    global.document = {
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

    const { HEYO } = require('../dist/index.js');
    const initialization = HEYO.init({
        projectId: '0123456789abcdef01234567',
        loadMode: 'lazy',
        scriptSrc: 'https://heyo.test/embed/script',
    });

    assert.equal(HEYO.getAgentStatus(), 'offline');
    assert.equal(new URL(injectedScript.src).searchParams.get('loadMode'), 'lazy');

    window.HEYO = {
        getAgentStatus() {
            statusReads += 1;
            return 'online';
        },
    };
    injectedScript.onload();

    await initialization;
    await new Promise((resolve) => setImmediate(resolve));

    assert.equal(statusReads, 1);
});
