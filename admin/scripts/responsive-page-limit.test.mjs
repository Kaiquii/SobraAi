import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { runInNewContext } from "node:vm";
import ts from "typescript";

test("um erro de consulta mantém o limite e o redimensionamento real recalcula", () => {
  const source = readFileSync(new URL("../hooks/useResponsivePageLimit.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  });
  const events = new Map();
  let nextFrame;
  let onContentResize;
  const window = {
    innerWidth: 1228,
    innerHeight: 690,
    devicePixelRatio: 1,
    addEventListener: (name, listener) => events.set(name, listener),
    matchMedia: () => ({ addEventListener() {} }),
    cancelAnimationFrame() { nextFrame = undefined; },
    requestAnimationFrame(callback) { nextFrame = callback; return 1; },
  };
  const capacity = {
    clientWidth: 1196,
    clientHeight: 450,
    querySelector: () => ({ getBoundingClientRect: () => ({ height: 30 }) }),
  };
  const exports = {};
  runInNewContext(outputText, {
    exports,
    window,
    document: { addEventListener() {} },
    ResizeObserver: class {
      constructor(callback) { onContentResize = callback; }
      observe() {}
    },
    require(path) {
      if (path === "react") {
        return { useRef: (value) => ({ current: value }), useLayoutEffect: (effect) => effect() };
      }
      assert.equal(path, "@/lib/pagination");
      return { MAX_PAGE_LIMIT: 100 };
    },
  });
  const requestedLimits = [];
  exports.useResponsivePageLimit({
    containerRef: {
      current: {
        querySelector: () => capacity,
        style: { setProperty() {} },
      },
    },
    currentLimit: 8,
    isLayoutReady: true,
    onLimitChange: (limit) => requestedLimits.push(limit),
    rowHeight: 48,
  });

  for (const height of [394, 450, 394, 450]) {
    capacity.clientHeight = height;
    onContentResize();
    nextFrame();
  }
  assert.deepEqual(requestedLimits, []);

  window.innerHeight = 736;
  capacity.clientHeight = 496;
  events.get("resize")();
  nextFrame();
  assert.deepEqual(requestedLimits, [9]);
});
