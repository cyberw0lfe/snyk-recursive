const readlineSync = require('readline-sync')
const { printTestResult, printSnykError } = require('../utils/printer')
const { countSeverityLevels, buildPasses } = require('../utils/severity')
const { green, red } = require('chalk')

const parseError = (result, devMode) => {
  if (devMode) {
    const response = readlineSync.question(red('Error running Snyk! Print error? (y/n) '))
    if (response.toLowerCase() === 'y') printSnykError(result)
  } else {
    console.log(red('ERROR running Snyk!'))
    printSnykError(result)
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
  const filteredResults = results.filter(result => !!result)
  filteredResults.forEach(result => {
    result.error ? parseError(result, devMode) : parseResult(result, devMode)
  })

  if (!devMode) {
    console.log(green('SNYK SECURITY SCAN PASSED'))
  }
}

module.exports = parseResults