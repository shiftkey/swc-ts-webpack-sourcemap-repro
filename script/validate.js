/*
 * Source map validation script
 *
 * Source maps are essential debugging and supportability tools. Malformed or
 * dysfunctional maps can significantly slow us down.
 *
 * This script makes a best attempt at ensuring that built maps are valid and
 * functional.
 *
 * See https://github.com/github/memex/issues/3276 for some relevant context.
 */

const { readFileSync } = require("fs");
const { relative } = require("path");
const glob = require("glob");
const validate = require("sourcemap-validator");

const argsLength = process.argv.length;
const directory = process.argv[argsLength - 1];

function assertIsError(error) {
  if (!(error instanceof Error)) {
    return false;
  }

  if ("code" in error) {
    return true;
  }

  return false;
}

glob(`${process.cwd()}/${directory}/*.js`, (err, matches) => {
  if (err) {
    throw err;
  }

  for (const match of matches) {
    const bundlePath = match;
    const mapPath = `${match}.map`;

    try {
      const bundleContent = readFileSync(bundlePath, "utf-8");
      const mapContent = readFileSync(mapPath, "utf-8");
      validate(bundleContent, mapContent);
      console.log(
        `Validation for sourcemap at ${mapPath} completed without issues`
      );
    } catch (error) {
      console.log(`Error for sourcemap at ${mapPath} encountered`);
      if (assertIsError(error) && error.code === "ENOENT") {
        // eslint-disable-next-line no-console
        console.error(
          `Error: '${bundlePath}' and '${mapPath}' must both exist (${error.message}).`
        );
        process.exit(1);
      }

      throw error;
    }
  }
});
