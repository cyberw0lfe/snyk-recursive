#! /usr/bin/env node
const { existsSync } = require('fs')
const { spawn } = require('child_process')
const argv = require('yargs').argv
const readlineSync = require('readline-sync')
const chalk = require('chalk')
const which = require('which')
const { getMonorepoPackages, printTestResult, countSeverityLevels, severityLevels } = require('./utils')

const severityLevel = argv.severity
const devMode = severityLevel == null
const green = chalk.green
const red = chalk.red
const yellow = chalk.yellow

const SNYK_BIN = which.sync('snyk', { nothrow: true })

const snyk = path => {
  const isPackage = existsSync(`${path}/package.json`)
  const isNodeModules = existsSync(`${path}/node_modules`)
  if (isPackage && isNodeModules) {
    return new Promise((resolve, reject) => {
      let snykOutput = ''
      const snyk = spawn(SNYK_BIN, [ 'test', path, '--json' ])

      snyk.stdout.on('data', data => {
        snykOutput += data
      })

      snyk.stdout.on('end', data => {
        console.log(green(`Successfully ran Snyk in directory: ${path}`))
        resolve(snykOutput)
      })

      snyk.stderr.on('data', err => {
        if (err) reject(err)
      })

      snyk.on('error', err => {
        if (err) reject(err)
      })
    })
      .catch(err => {
        console.log(red(err))
      })
  } else {
    console.log(yellow(`No package.json or node_modules found in directory: ${path}`))
  }
}

const buildPasses = severities => {
  const { low, medium, high } = severities
  if (severityLevel === severityLevels.high && high > 0) return false
  if (severityLevel === severityLevels.medium && high + medium > 0) return false
  if (severityLevel === severityLevels.low && high + medium + low > 0) return false
  return true
}

const handleResults = results => {
  const filteredResults = results.filter(result => !!result)
  filteredResults.forEach(result => {
    try {
      const jsonResult = JSON.parse(result)
      const severities = countSeverityLevels(jsonResult)
      if (devMode) {
        printTestResult(jsonResult, severities)
      } else if (!devMode && !buildPasses(severities)) {
        printTestResult(jsonResult, severities)
        console.log(red('\nSNYK SECURITY SCAN FAILED'))
        process.exit(1)
      }
    } catch (err) {
      console.log(red(`WARNING Error printing snyk results: ${err}`))
      if (devMode) {
        // this is added because sometimes the result stream is cut off, causing an error parsing the JSON
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

const runSnyk = paths => {
  const results = paths.map(path => snyk(path))
  Promise.all(results)
    .then(values => {
      handleResults(values)
    })
}

if (SNYK_BIN) {
  const paths = getMonorepoPackages()
  paths.length > 0 ? runSnyk(paths) : console.log(red(`No packages found, make sure to run at monorepo root directory!`)) && process.exit(1)
} else {
  console.log('ERROR: Snyk not found')
  process.exit(1)
}
