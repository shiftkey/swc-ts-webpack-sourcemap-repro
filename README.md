This works for `@swc/core` version 1.3.3 or earlier:

```
npm i
npm run cli:old
npm run cli:new
npm run webpack:old
npm run webpack:new
```

Each of these steps transpiles a simple TS + React app and validates the
sourcemaps locally. The `old` approach uses `sourcemap-validator` in a CLI 
script, and the new approach uses the `source-map` to manually walk the mappings
to valiate changes.

But with `@swc/core` `1.3.4` or later there are validation issues with the
generated sourcemap using either tool which seem to be related to `swc-loader`:

```
npm install --include=dev @swc/core@1.3.4
npm run cli:old       // works
npm run cli:new       // works
npm run webpack:old   // fails 💥 
npm run webpack:new   // fails 💥 
```

The last command is recommended because it's using the `source-map` library
directly to verify the mappings and emits more details about the warnings.

```
npm run webpack:new

> swc-ts-webpack-sourcemap-repro@1.0.0 validate:webpack:new
> TS_NODE_PROJECT="tsconfig.cli.json" ts-node script/validate-new.ts dist/webpack/

Validating bundle /Users/shiftkey/src/swc-ts-webpack-sourcemap-repro/dist/webpack/main.bundle.js
Validating sourcemap /Users/shiftkey/src/swc-ts-webpack-sourcemap-repro/dist/webpack/main.bundle.js.map
✅ No errors found
BadColumnError found {
  message: 'Expected token not in correct location',
  source: 'webpack://swc-ts-webpack-sourcemap-repro/src/index.tsx',
  token: '><App /></',
  expected: 'StrictMode'
}
Context {
  originalContext: [
    [ 6, "const appContainer = document.getElementById('memex-root')" ],
    [ 7, '' ],
    [ 8, 'render(<StrictMode><App /></StrictMode>, appContainer)' ]
  ],
  originalColumn: 18,
  originalLine: 8,
  generatedColumn: 138097,
  generatedLine: 2,
  generatedContext: '"memex-root");(0,r.render)((0,e.jsx)(n.StrictMode,{children:(0,e.jsx)(l,{})}),a)})()})();'
}

BadColumnError found {
  message: 'Expected token not in correct location',
  source: 'webpack://swc-ts-webpack-sourcemap-repro/src/index.tsx',
  token: '/>',
  expected: 'App'
}
Context {
  originalContext: [
    [ 6, "const appContainer = document.getElementById('memex-root')" ],
    [ 7, '' ],
    [ 8, 'render(<StrictMode><App /></StrictMode>, appContainer)' ]
  ],
  originalColumn: 23,
  originalLine: 8,
  generatedColumn: 138119,
  generatedLine: 2,
  generatedContext: 'der)((0,e.jsx)(n.StrictMode,{children:(0,e.jsx)(l,{})}),a)})()})();'
}

BadColumnError found {
  message: 'Expected token not in correct location',
  source: 'webpack://swc-ts-webpack-sourcemap-repro/src/index.tsx',
  token: '/>',
  expected: 'App'
}
Context {
  originalContext: [
    [ 6, "const appContainer = document.getElementById('memex-root')" ],
    [ 7, '' ],
    [ 8, 'render(<StrictMode><App /></StrictMode>, appContainer)' ]
  ],
  originalColumn: 23,
  originalLine: 8,
  generatedColumn: 138120,
  generatedLine: 2,
  generatedContext: 'er)((0,e.jsx)(n.StrictMode,{children:(0,e.jsx)(l,{})}),a)})()})();'
}


```

This has also been seen on `sourcemaps.io` (which the `new` scripts is based
upon to enable CI verification).
