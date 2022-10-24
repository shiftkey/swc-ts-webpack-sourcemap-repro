// import from https://github.com/getsentry/sourcemaps.io/blob/991ebe5e2ac100e1faefba95be7a2199fae5a487/server/src/lib/interfaces.ts
// under Apache 2.0 License

import Report from './report'

export interface ReportCallback {
  (report: Report): void
}

export interface ContextMapping {
  originalContext: Array<[number, string]> // Array of line number/source code tuples, e.g. [1, "const x = 1;"]
  generatedContext: string
  originalLine: number
  originalColumn: number
  generatedLine: number
  generatedColumn: number
}