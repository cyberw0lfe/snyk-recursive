const readlineSync = require('readline-sync')
const argv = require('yargs').argv
const { printTestResult, countSeverityLevels } = require('./utils')
const chalk = require('chalk')
const green = chalk.green
const red = chalk.red
const yellow = chalk.yellow
const severityLevel = argv.severity
const devMode = severityLevel == null

const parseResults = results => {
  const filteredResults = results.filter(result => !!result)
  filteredResults.forEach(result => {
    try {
      const severities = countSeverityLevels(result)
      if (devMode) {
        printTestResult(result, severities)
      } else if (!devMode && !buildPasses(severities)) {
        printTestResult(result, severities)
        console.log(red('\nSNYK SECURITY SCAN FAILED'))
        process.exit(1)
      }
    } catch (err) {
      console.log(yellow(`WARNING Error printing snyk results: ${err}`))
      if (devMode) {
        // this is added because sometimes the result stream is cut off, causing an error parsing the JSON
        // if this happens look to increase the file limits, see readme
        const response = readlineSync.question('Print result causing error? (y/n) ')
        if (response.toLowerCase() === 'y') console.log(red(result))
      } else {
        console.log(red(`Offending result: ${result}`))
      }
    }
  })

  if (!devMode) {
    console.log(green('SNYK SECURITY SCAN PASSED'))
  }
}

module.exports = parseResults