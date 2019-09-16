#! /usr/bin/env node
const which = require('which')
const { getSubdirectories } = require('./utils')
const { snykSync, snykAsync } = require('./snyk')
const parseResults = require('./parseResults')

const runSnyk = paths => {
  const results = paths.map(path => snykSync(path))
  Promise.all(results)
    .then(values => {
      parseResults(values)
    })
}

const SNYK_BIN = which.sync('snyk', { nothrow: true })
if (SNYK_BIN) {
  const paths = getSubdirectories()
  // console.log(`Found subdirectories: ${paths}`)
  paths.length > 0 ? runSnyk(paths) : console.log(red(`No packages found, make sure to run at the root directory!`)) && process.exit(1)
} else {
  console.log('ERROR: Snyk not found')
  process.exit(1)
}