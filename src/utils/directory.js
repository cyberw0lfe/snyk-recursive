const fs = require('fs')
const path = require('path')

const targetFiles = ['package.json', 'package-lock.json', 'yarn.json', 'yarn.lock']
const isValidSnykDirectory = path => {
  const dirFiles = fs.readdirSync(path)
  const hasModules = dirFiles.includes('node_modules')
  const hasDepRecord = dirFiles.filter(file => targetFiles.includes(file)).length > 0
  return hasModules && hasDepRecord ? true : false
}

const isTargetDir = dirPath => {
  if(dirPath.indexOf('node_modules') >= 0) return false
  if(dirPath.indexOf('.git') >= 0) return false
  return true
}

const walk = (dir) => {
  let dirs = []
  const contents = fs.readdirSync(dir)
  contents.forEach(file => {
    const dirPath = path.join(dir, file)
    if(fs.statSync(dirPath).isDirectory()) {
      isTargetDir(dirPath) && dirs.push(dirPath)
      dirs = dirs.concat(walk(dirPath))
    }
  })
  return dirs
}

const getSubdirectories = () => {
  const dirs = walk('./')
  dirs.push('./')
  return dirs.filter(dir => isValidSnykDirectory(dir))
}

module.exports = { getSubdirectories, isValidSnykDirectory }