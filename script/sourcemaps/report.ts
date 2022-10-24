// imported from https://github.com/getsentry/sourcemaps.io/blob/991ebe5e2ac100e1faefba95be7a2199fae5a487/server/src/lib/report.ts
// under Apache 2.0 license

export default class Report {
  warnings: Array<Error>
  errors: Array<Error>
  sources: Array<string>

  url?: string
  sourceMap?: string

  constructor(report: Partial<Report> = {}) {
    this.warnings = report.warnings || []
    this.errors = report.errors || []
    this.sources = report.sources || []

    this.url = report.url
    this.sourceMap = report.sourceMap
  }

  pushError(...errors: Array<Error>) {
    this.errors.push(...errors)
    return this
  }

  pushWarning(...warnings: Array<Error>) {
    this.warnings.push(...warnings)
    return this
  }

  pushSource(...sources: Array<string>) {
    this.sources.push(...sources)
    return this
  }

  concat(report: Report) {
    const copy = new Report(this)
    copy.errors = copy.errors.concat(report.errors)
    copy.warnings = copy.warnings.concat(report.warnings)
    copy.sources = copy.sources.concat(report.sources)
    copy.sourceMap = report.sourceMap || copy.sourceMap
    copy.url = report.url || copy.url
    return copy
  }

  size() {
    return this.errors.length + this.warnings.length
  }
}