// imported from https://github.com/getsentry/sourcemaps.io/blob/991ebe5e2ac100e1faefba95be7a2199fae5a487/server/src/lib/validateMappings.ts
// under Apache 2.0 License

import Report from './report'
import {SourceMapConsumer, MappingItem} from 'source-map'

import {LineNotFoundError, BadTokenError, BadColumnError} from './errors'

const MAX_REPORT_SIZE = 100

/**
 * Validate a single mapping
 * @param {object} mapping A single mapping (from SourceMapConsumer)
 * @param {*} sourceLines An array of source lines from the original file
 * @param {*} generatedLines An array of source lines from the generated (transpiled) file
 */
function validateMapping(mapping: MappingItem, sourceLines: Array<string>, generatedLines: Array<string>) {
  let origLine: string | undefined
  try {
    origLine = sourceLines[mapping.originalLine - 1]
    // eslint-disable-next-line no-empty
  } catch (e) {}

  if (!origLine) {
    return new LineNotFoundError(mapping.source, {
      line: mapping.originalLine,
      column: mapping.originalColumn
    })
  }

  let sourceToken = origLine.slice(mapping.originalColumn, mapping.originalColumn + mapping.name.length).trim()

  // Token matches what we expect; everything looks good, bail out
  if (sourceToken === mapping.name) {
    return null
  }

  // Start of token starts with a quote or apostrophe. This might be
  // a bug in Uglify where it maps a token to the string of a token
  // incorrectly - but it should still be fine for end users.
  if (sourceToken.startsWith("'") || sourceToken.startsWith('"')) {
    sourceToken = origLine.slice(mapping.originalColumn + 1, mapping.originalColumn + mapping.name.length + 1).trim()
  }

  if (sourceToken === mapping.name) {
    return null
  }

  // If the line _contains_ the expected token somewhere, the source
  // map will likely work fine (especially for Sentry).
  const ErrorClass = origLine.indexOf(mapping.name) > -1 ? BadColumnError : BadTokenError

  const {generatedColumn} = mapping

  let generatedLine = ''
  try {
    generatedLine = generatedLines[mapping.generatedLine - 1]
  } catch (e) {
    // do nothing
  }

  // Take 5 lines of original context
  const contextLines: Array<[number, string]> = []
  for (let i = Math.max(mapping.originalLine - 3, 0); i < mapping.originalLine + 2 && i < sourceLines.length; i++) {
    contextLines.push([i + 1, sourceLines[i]])
  }

  // Take 100 chars of context around generated line
  const generatedContext = generatedLine.slice(generatedColumn - 50, generatedColumn + 50)

  return new ErrorClass(mapping.source, {
    token: sourceToken,
    expected: mapping.name,
    mapping: {
      originalContext: contextLines,
      originalLine: mapping.originalLine,
      originalColumn: mapping.originalColumn,
      generatedContext,
      generatedLine: mapping.generatedLine,
      generatedColumn: mapping.generatedColumn
    }
  })
}

/**
 * Validate every mapping found in a source map
 * @param {SourceMapConsumer} sourceMapConsumer Pre-initialized with the source map content
 * @param {array} generatedLines Array of lines from the generated (transpiled) output
 */
export default function validateMappings(sourceMapConsumer: SourceMapConsumer, generatedLines: Array<string>) {
  const report = new Report()
  const sourceCache: any = {}

  sourceMapConsumer.eachMapping((mapping: MappingItem) => {
    if (report.size() >= MAX_REPORT_SIZE) {
      return
    }

    // If we don't have a token name for this mapping, skip
    if (!mapping.name) {
      return
    }

    const {source} = mapping
    let sourceLines
    if ({}.hasOwnProperty.call(sourceCache, source)) {
      sourceLines = sourceCache[source]
    } else {
      const sourceContent = sourceMapConsumer.sourceContentFor(mapping.source)
      if (!sourceContent) {
        // TODO: blow up
        return
      }
      sourceLines = sourceContent.split(/\n/)
      sourceCache[mapping.source] = sourceLines
    }

    const error = validateMapping(mapping, sourceLines, generatedLines)

    // Treat bad column errors as warnings (since they'll work fine for
    // most apps)
    if (error && error.name === 'BadColumnError') {
      report.pushWarning(error)
    } else if (error) {
      report.pushError(error)
    }
  })
  return report
}