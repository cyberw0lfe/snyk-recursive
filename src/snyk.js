const { existsSync } = require('fs')
const { spawn, spawnSync } = require('child_process')
const which = require('which')
const argv = require('yargs').argv
const chalk = require('chalk')
const green = chalk.green
const red = chalk.red
const yellow = chalk.yellow
const SNYK_BIN = which.sync('snyk', { nothrow: true })

const severityLevel = argv.severity
const severityParam = severityLevel ? `--severity-threshold=${severityLevel}` : null
const isAsync = argv.async
const isValidDirectory = path => existsSync(`${path}/package.json`) && existsSync(`${path}/node_modules`)

const snykSync = (path, resolve, reject) => {
  const snyk = spawnSync(SNYK_BIN, [ `test`, severityParam, `--file=package.json`, `--json`, path ])
  console.log(green(`Successfully ran Snyk in directory: ${path}`))
  resolve(JSON.parse(snyk.stdout.toString())[1])
}

const snykAsync = (path, resolve, reject) => {
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
}

const snyk = path => {
  if (isValidDirectory(path)) {
    return new Promise((resolve, reject) => {
      isAsync ? snykAsync(path, resolve, reject) : snykSync(path, resolve, reject)
    })
    .catch(err => {
      console.log(red(err))
    })
  } else {
    // console.log(yellow(`No package.json or node_modules found in directory: ${path}`))
    // make this check explicit for no node_modules
  }
}

module.exports = snyk