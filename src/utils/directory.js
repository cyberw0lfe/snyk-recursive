const fs = require('fs')
const path = require('path')

const targetFiles = ['package.json', 'package-lock.json', 'yarn.json', 'yarn.lock']
const isValidSnykDirectory = path => {
  const dirFiles = fs.readdirSync(path)
  const hasModules = dirFiles.includes('node_modules')
  const hasDepRecord = dirFiles.filter(file => targetFiles.includes(file)).length > 0
  return hasModules && hasDepRecord ? true : false
}

const dirs = []
const walkDir = dir => {  
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f)
    const isDir = fs.statSync(dirPath).isDirectory()
    const isNodeMod = dirPath.indexOf('node_modules') >= 0
    const isGit = dirPath.indexOf('.git') >= 0

    if (!isNodeMod && !isGit && isDir) {
      dirs.push(dirPath)
      walkDir(dirPath)
    }
  })
}

const getSubdirectories = () => {
  walkDir('./')
  if(isValidSnykDirectory('./')) dirs.push('./')
  
  return dirs.filter(dir => isValidSnykDirectory(dir))
}

module.exports = { getSubdirectories, isValidSnykDirectory }