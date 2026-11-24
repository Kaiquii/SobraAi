import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const workerSource = readFileSync(new URL("../public/sw.js", import.meta.url), "utf8");
function worker({ origin = "https://admin.example", blocked = false } = {}) {
  const handlers = new Map(), deletes = [], requests = [], puts = [];
  let claimed = false;
  const cache = { addAll: async () => {}, match: async () => null,
    put: async (...args) => puts.push(args), keys: async () => [], delete: async (key) => deletes.push(key) };
  const response = { ok: true, status: 200, type: "basic", redirected: false, clone() { return this; } };
  const self = { location: { origin }, addEventListener: (name, handler) => handlers.set(name, handler),
    skipWaiting: () => {}, clients: { claim: async () => { claimed = true; } } };
  vm.runInNewContext(workerSource, { self, URL,
    caches: { open: async () => { if (blocked) throw Error("Storage blocked"); return cache; },
      keys: async () => ["sobra-ai-admin-static-v1", "sobra-ai-admin-static-v2", "another-app"],
      delete: async (name) => deletes.push(name) },
    fetch: async (request) => { requests.push(request.url); return response; },
  });
  async function fetchAsset(path, extra = {}) {
    let result;
    const pending = [];
    handlers.get("fetch")({ request: { url: origin + path, method: "GET", mode: "cors", cache: "default", ...extra },
      respondWith: (promise) => { result = promise; }, waitUntil: (promise) => pending.push(promise) });
    const value = result ? await result : undefined;
    await Promise.all(pending);
    return value;
  }
  return { handlers, deletes, requests, puts, fetchAsset, response, get claimed() { return claimed; } };
}

test("development assets and HMR are never intercepted, including old workers left on localhost", async () => {
  const state = worker({ origin: "http://localhost:3002" });
  assert.equal(await state.fetchAsset("/_next/static/chunks/dev.js"), undefined);
  assert.equal(await state.fetchAsset("/_next/webpack-hmr"), undefined);
  assert.equal(state.requests.length, 0);
});

test("HTML, API, RSC, dynamic scripts and no-store requests bypass the cache", async () => {
  const state = worker();
  for (const [path, extra] of [
    ["/home", { mode: "navigate" }], ["/home?_rsc=test", {}], ["/api/auth/session", {}],
    ["/dynamic.js", { destination: "script" }], ["/_next/static/chunks/private.js", { cache: "no-store" }],
  ]) assert.equal(await state.fetchAsset(path, extra), undefined);
  assert.equal(state.requests.length, 0);
});

test("versioned static assets still work and cache after a successful network response", async () => {
  const state = worker();
  assert.equal(await state.fetchAsset("/_next/static/chunks/hashed.js"), state.response);
  assert.equal(state.requests.length, 1);
  assert.equal(state.puts.length, 1);
});

test("a full or unavailable cache cannot stop the application from loading scripts", async () => {
  const state = worker({ blocked: true });
  assert.equal(await state.fetchAsset("/_next/static/chunks/hashed.js"), state.response);
  assert.equal(state.requests.length, 1);
});

test("activation retires only the admin legacy cache, keeping other applications intact", async () => {
  const state = worker();
  let pending;
  state.handlers.get("activate")({ waitUntil: (promise) => { pending = promise; } });
  await pending;
  assert.deepEqual(state.deletes, ["sobra-ai-admin-static-v1"]);
  assert.equal(state.claimed, true);
});

test("the dev registrar unregisters only its root worker and clears only admin caches", async () => {
  const unregistered = [], removed = [], effects = [];
  const source = readFileSync(new URL("../components/pwa/PwaRegistrar.tsx", import.meta.url), "utf8");
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, URL, process: { env: { NODE_ENV: "development" } },
    require: () => ({ useEffect: (effect) => effects.push(effect) }),
    navigator: { serviceWorker: { getRegistrations: async () => ["http://localhost:3002/", "http://localhost:3002/other/"].map(scope => ({ scope, unregister: async () => unregistered.push(scope) })) } },
    window: { location: { href: "http://localhost:3002/home" }, caches: {
      keys: async () => ["sobra-ai-admin-static-v1", "another-app"], delete: async (key) => removed.push(key),
    } },
  });
  exports.PwaRegistrar();
  effects[0]();
  await new Promise(setImmediate);
  assert.deepEqual(unregistered, ["http://localhost:3002/"]);
  assert.deepEqual(removed, ["sobra-ai-admin-static-v1"]);
});
