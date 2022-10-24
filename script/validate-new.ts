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

import { readFileSync } from "fs";
import glob from "glob";
import { SourceMapConsumer } from "source-map";
import { BadColumnError } from "./sourcemaps/errors";
import validateMappings from "./sourcemaps/validateMappings";

const argsLength = process.argv.length;
const directory = process.argv[argsLength - 1];

glob(`${process.cwd()}/${directory}/*.js`, async (err, matches) => {
  if (err) {
    throw err;
  }

  for (const match of matches) {
    const bundlePath = match;
    const mapPath = `${match}.map`;
    console.log(`Validating bundle ${bundlePath}`);
    console.log(`Validating sourcemap ${mapPath}`);
    
    const bundleContent = readFileSync(bundlePath, "utf-8");
    const mapContent = readFileSync(mapPath, "utf-8");

    let rawSourceMap;
    try {
      rawSourceMap = JSON.parse(mapContent);
    } catch (err) {
      throw err;
    }

    const input = new SourceMapConsumer(rawSourceMap);
    const consumer = await input;

    if (!consumer.hasContentsOfAllSources()) {
      console.log(
        `Pre-condition failed - contents of some sources missing from sourcemap`
      );
      console.log(
        `TODO: update script to fetch and concatenate sources:`,
        consumer.sources
      );
    }

    const generatedLines = bundleContent.split("\n");
    const mappingsReport = validateMappings(consumer, generatedLines);

    if (mappingsReport.errors.length === 0) {
      console.log(`✅ No errors found`);
    } else {
      for (const error of mappingsReport.errors) {
        console.log(`Error found with mapping`, error);
      }
      process.exit(1);
    }

    if (mappingsReport.warnings.length === 0) {
      console.log(`✅ No warnings found`);
    } else {
      for (const warning of mappingsReport.warnings) {
        if (warning instanceof BadColumnError) {
          const { expected, source, token, message, mapping} = warning
          const {originalContext, originalColumn, originalLine, generatedColumn, generatedLine, generatedContext} = mapping
          console.log(`💥 BadColumnError found`, {message, source, token, expected});
          console.log(`Context`, {originalContext, originalColumn, originalLine, generatedColumn, generatedLine, generatedContext});
          console.log();
        } else {
          console.log(`💥 Warning found`, warning);
        }
        
      }
      process.exit(1);
    }

    console.log();
  }
});
