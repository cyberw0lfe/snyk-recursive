const { spawn, spawnSync } = require('child_process')
const which = require('which')
const { green, yellow, red } = require('chalk')
const { isValidSnykDirectory } = require('./utils/directory')

const SNYK_BIN = which.sync('snyk', { nothrow: true })

const snykSync = (path, snykArgs, resolve, reject) => {
  const snyk = spawnSync(SNYK_BIN, snykArgs)
  console.log(green(`Successfully ran Snyk in directory: ${path}`))
  resolve(JSON.parse(snyk.stdout.toString()))
}

const snykAsync = (path, snykArgs, resolve, reject) => {
  const snyk = spawn(SNYK_BIN, snykArgs)
  let snykOutput = ''
  snyk.stdout.on('data', data => {
    snykOutput += data
  })

  snyk.stdout.on('end', data => {
    console.log(green(`Successfully ran Snyk in directory: ${path}`))
    resolve(JSON.parse(snykOutput.toString()))
  })

  snyk.stderr.on('data', err => {
    if (err) reject(err)
  })

  snyk.on('error', err => {
    if (err) reject(err)
  })
}

const snyk = (path, severity, org, isAsync) => {
  if (isValidSnykDirectory(path)) {
    return new Promise((resolve, reject) => {
      const snykArgs = ['test', '--json', path]
      severity && snykArgs.push(`--severity-threshold=${severity}`)
      org && snykArgs.push(`--org=${org}`)
      isAsync ? snykAsync(path, snykArgs, resolve, reject) : snykSync(path, snykArgs, resolve, reject)
    })
    .catch(err => {
      console.log(red(err))
    })
  } else {
    console.log(yellow(`No dependency record or node_modules found in directory: ${path}`))
  }
}

module.exports = snyk