const { existsSync } = require('fs')
const { spawn, spawnSync } = require('child_process')
const which = require('which')
const argv = require('yargs').argv
const chalk = require('chalk')
const fs = require('fs')
const severityLevel = argv.severity
const green = chalk.green
const red = chalk.red
const yellow = chalk.yellow
const SNYK_BIN = which.sync('snyk', { nothrow: true })

const snykSync = path => {
  console.log(`Running Snyk in directory: ${path}`)
  const isPackage = existsSync(`${path}/package.json`)
  const isNodeModules = existsSync(`${path}/node_modules`)

  if (isPackage && isNodeModules) {
    return new Promise((resolve, reject) => {
      const severityParam = severityLevel ? `--severity-threshold=${severityLevel}` : null
      const snyk = spawnSync(SNYK_BIN, [ `test`, severityParam, `--file=package.json`, `--json`, path ])
      console.log(green(`Successfully ran Snyk in directory: ${path}`))
      const output = JSON.parse(snyk.stdout.toString())[1]
      console.log(output)
      resolve(output)
    })
      .catch(err => {
        console.log(red(err))
      })
  } else {
    console.log(yellow(`No package.json or node_modules found in directory: ${path}`))
  }
}

const snykAsync = path => {
  console.log(`Running Snyk in directory: ${path}`)
  const isPackage = existsSync(`${path}/package.json`)
  const isNodeModules = existsSync(`${path}/node_modules`)

  if (isPackage && isNodeModules) {
    return new Promise((resolve, reject) => {
      const severityParam = severityLevel ? `--severity-threshold=${severityLevel}` : null
      // const snyk = spawn(SNYK_BIN, [ `test`, severityParam, `--file=package.json`, `--json`, path ])
      const snyk = spawnSync(SNYK_BIN, [ `test`, severityParam, `--file=package.json`, `--json`, path ])

      let snykOutput = ''
      snyk.stdout.on('data', data => {
        snykOutput += data
      })

      snyk.stdout.on('end', data => {
        // const name = require(`${path}/package.json`).name

        // if (!devMode) {
        //   const monitor = spawn(SNYK_BIN, [ `monitor`, `--project-name=${name}` ], { cwd: `${path}` })
        //   monitor.stdout.on('end', data => {
        //     resolve(snykOutput)
        //   })
        // } else {
        //   resolve(snykOutput)
        // }
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

module.exports = { snykSync, snykAsync}