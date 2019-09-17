const { existsSync } = require('fs')
const { spawn, spawnSync } = require('child_process')
const which = require('which')
const argv = require('yargs').argv
const chalk = require('chalk')
const severityLevel = argv.severity
const green = chalk.green
const red = chalk.red
const yellow = chalk.yellow
const SNYK_BIN = which.sync('snyk', { nothrow: true })

const snykSync = path => {
  const isValidDirectory = existsSync(`${path}/package.json`) && existsSync(`${path}/node_modules`)

  if (isValidDirectory) {
    return new Promise((resolve, reject) => {
      const severityParam = severityLevel ? `--severity-threshold=${severityLevel}` : null
      const snyk = spawnSync(SNYK_BIN, [ `test`, severityParam, `--file=package.json`, `--json`, path ])
      console.log(green(`Successfully ran Snyk in directory: ${path}`))
      resolve(JSON.parse(snyk.stdout.toString())[1])
    })
      .catch(err => {
        console.log(red(err))
      })
  } else {
    // console.log(yellow(`No package.json or node_modules found in directory: ${path}`))
  }
}

const snykAsync = path => {
  console.log(`Running Snyk in directory: ${path}`)
  const isPackage = existsSync(`${path}/package.json`)
  const isNodeModules = existsSync(`${path}/node_modules`)

  if (isPackage && isNodeModules) {
    return new Promise((resolve, reject) => {
      const severityParam = severityLevel ? `--severity-threshold=${severityLevel}` : null
      const snyk = spawn(SNYK_BIN, [ `test`, severityParam, `--file=package.json`, `--json`, path ])

      let snykOutput = ''
      snyk.stdout.on('data', data => {
        snykOutput += data
      })

      snyk.stdout.on('end', data => {
        console.log(green(`Successfully ran Snyk in directory: ${path}`))
        resolve(JSON.parse(snykOutput.toString())[1])
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

module.exports = { snykSync, snykAsync}