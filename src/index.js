#! /usr/bin/env node
const which = require('which')
const argv = require('yargs').argv
const snyk = require('./snyk')
const { getSubdirectories } = require('./utils/directory')
const parseResults = require('./utils/parseResults')
const { red } = require('chalk')

const severity = argv.severity
const org = argv.org
const isAsync = argv.async

const runSnyk = paths => {
  const results = paths.map(path => snyk(path, severity, org, isAsync))
  Promise.all(results)
    .then(values => {
      parseResults(values, !severity)
    })
}

if(argv.v || argv.version) {
  console.log(require('../package.json').version)
  process.exit(0)
}

const SNYK_BIN = which.sync('snyk', { nothrow: true })
if (SNYK_BIN) {
  console.log(`Finding subdirectories...`)
  const paths = getSubdirectories()
  console.log(`Found ${paths.length} valid directories`)
  paths.length > 0 ? runSnyk(paths) : console.log(red(`No packages found, make sure to run at the root directory!`)) && process.exit(1)
} else {
  console.log('ERROR: Snyk not found')
  process.exit(1)
}