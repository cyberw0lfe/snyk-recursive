const { printTestResult, printSnykError } = require('../utils/printer')
const { countSeverityLevels, buildPasses } = require('../utils/severity')
const { green, red } = require('chalk')

const parseErrors = (results, devMode) => {
  console.log(red('ERROR running Snyk!'))  
  results.forEach(result => printSnykError(result))
  if (!devMode) {
    console.log(red('Failing build. . .'))
    process.exit(1)
  }
}

const parseResult = (result, devMode) => {
  const severities = countSeverityLevels(result)
  if (devMode) {
    printTestResult(result, severities)
  } else if (!buildPasses(severities)) {
    printTestResult(result, severities)
    console.log(red('\nSNYK SECURITY SCAN FAILED'))
    process.exit(1)
  }
}

const parseResults = (results, devMode) => {
  const errors = []
  const filteredResults = results.filter(result => !!result)
  filteredResults.forEach(result => {
    result.error ? errors.push(result) : parseResult(result, devMode)
  })

  parseErrors(errors, devMode)

  if (!devMode) {
    console.log(green('SNYK SECURITY SCAN PASSED'))
  }
}

module.exports = parseResults