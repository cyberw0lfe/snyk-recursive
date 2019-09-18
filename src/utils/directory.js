const globby = require('globby')
const { readdirSync } = require('fs')

const getSubdirectories = () => {
  const packages = globby.sync(`./*/**/package.json`)
  const filteredPacakges = packages.filter(pkg => !/node_modules/gi.test(pkg))
  return filteredPacakges.map(path => path.replace(/\/package.json/, ''))
}

const targetFiles = ['package.json', 'package-lock.json', 'yarn.json', 'yarn.lock']
const isValidDirectory = path => {
  const dirFiles = readdirSync(path)
  const hasModules = dirFiles.includes('node_modules')
  const hasDepRecord = dirFiles.filter(file => targetFiles.includes(file)).length > 0
  return hasModules && hasDepRecord ? true : false
}

module.exports = { getSubdirectories, isValidDirectory }