const { spawn, spawnSync } = require('child_process')
const which = require('which')
const argv = require('yargs').argv
const { green, yellow, red } = require('chalk')
const { isValidDirectory } = require('./utils/directory')

const SNYK_BIN = which.sync('snyk', { nothrow: true })
const severityParam = argv.severity ? `--severity-threshold=${argv.severity}` : null
const orgParam = argv.org ? `--org=${argv.org}` : null
const isAsync = argv.async

const snykSync = (path, resolve, reject) => {
  const snyk = spawnSync(SNYK_BIN, [ `test`, severityParam, orgParam, `--json`, path ])
  console.log(green(`Successfully ran Snyk in directory: ${path}`))
  resolve(JSON.parse(snyk.stdout.toString())[1])
}

const snykAsync = (path, resolve, reject) => {
  const snyk = spawn(SNYK_BIN, [ `test`, severityParam, orgParam, `--json`, path ])

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
    // console.log(yellow(`No dependency record or node_modules found in directory: ${path}`))
  }
}

module.exports = snyk