const readlineSync = require('readline-sync')
const { printTestResult } = require('../utils/printer')
const { countSeverityLevels, buildPasses } = require('../utils/severity')
const { green, red, yellow } = require('chalk')

const parseResults = (results, devMode) => {
  const filteredResults = results.filter(result => !!result)
  filteredResults.forEach(result => {
    try {
      const severities = countSeverityLevels(result)
      if (devMode) {
        printTestResult(result, severities)
      } else if (!buildPasses(severities)) {
        printTestResult(result, severities)
        console.log(red('\nSNYK SECURITY SCAN FAILED'))
        process.exit(1)
      }
    } catch (err) {
      console.log(yellow(`WARNING Error printing snyk results: ${err}`))
      if (devMode) {
        // this is added because sometimes the result stream is cut off, causing an error parsing the JSON
        const response = readlineSync.question('Print result causing error? (y/n) ')
        if (response.toLowerCase() === 'y') console.log(red(JSON.stringify(result)))
        // error to handle for below
        //{"ok":false,"error":"Dependency ijbap-shared-components was not found in yarn.lock. Your package.json and yarn.lock are probably out of sync. Please run \"yarn install\" and try again.","path":"packages/components/common/master-layout"}
      } else {
        console.log(red(`Offending result: ${JSON.stringify(result)}`))
      }
    }
  })

  if (!devMode) {
    console.log(green('SNYK SECURITY SCAN PASSED'))
  }
}

module.exports = parseResults