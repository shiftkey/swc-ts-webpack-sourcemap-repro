# `@swc/core` + `swc-loader` sourcemap repro

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
💥 Warnings found:
 - BadColumnError found {
  message: 'Expected token not in correct location',
  source: 'webpack://swc-ts-webpack-sourcemap-repro/src/index.tsx',
  token: '/>',
  expected: 'App'
}
Context {
  originalContext: [
    [
      4,
      "const appContainer = document.getElementById('project-root')"
    ],
    [ 5, '' ],
    [ 6, 'render(<App />, appContainer)' ]
  ],
  originalColumn: 11,
  originalLine: 6,
  generatedColumn: 138079,
  generatedLine: 2,
  generatedContext: 'mentById("project-root");(0,n.render)((0,e.jsx)(r,{}),l)})()})();'
}

 - BadColumnError found {
  message: 'Expected token not in correct location',
  source: 'webpack://swc-ts-webpack-sourcemap-repro/src/index.tsx',
  token: '/>',
  expected: 'App'
}
Context {
  originalContext: [
    [
      4,
      "const appContainer = document.getElementById('project-root')"
    ],
    [ 5, '' ],
    [ 6, 'render(<App />, appContainer)' ]
  ],
  originalColumn: 11,
  originalLine: 6,
  generatedColumn: 138080,
  generatedLine: 2,
  generatedContext: 'entById("project-root");(0,n.render)((0,e.jsx)(r,{}),l)})()})();'
}

```

This has also been seen on `sourcemaps.io` (which the `new` scripts is based
upon to enable CI verification).
