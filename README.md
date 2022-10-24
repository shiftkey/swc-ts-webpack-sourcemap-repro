This works for `@swc/core` version 1.3.3 or earlier:

```
npm i
npm run cli:old
npm run cli:new
npm run webpack:old
npm run webpack:new
```

Each of these steps transpiles a simple TS + React app and validates the sourcemaps
locally.

But with `@swc/core` `1.3.4` or later there are validation issues with the
generated sourcemap after passing it through `swc-loader`:

```
npm install --include=dev @swc/core@1.3.4
npm run cli:old       // works
npm run cli:new       // works
npm run webpack:old   // fails 💥 
npm run webpack:new   // fails 💥 
```

The last command is recommended because it's using the `source-map` library
directly to verify the mappings, which seems to be the root cause of the
failures.

This has also been seen on `sourcemaps.io` (which the `new` scripts is based
upon to enable CI verification).