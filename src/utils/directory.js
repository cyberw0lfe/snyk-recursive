const fs = require('graceful-fs')
const path = require('path')

const targetFiles = ['package.json', 'package-lock.json', 'yarn.json', 'yarn.lock']
const isValidSnykDirectory = path => {
  const dirFiles = fs.readdirSync(path)
  const hasModules = dirFiles.includes('node_modules')
  const hasDepRecord = dirFiles.filter(file => targetFiles.includes(file)).length > 0
  return hasModules && hasDepRecord ? true : false
}

const shouldAddDir = dirPath => {
  if(dirPath.indexOf('.') === 0) return false // mitigates directories such as .git/objects/24
  if(dirPath.indexOf('node_modules') >= 0) return false
  if(!fs.statSync(dirPath).isDirectory()) return false
  return true
}

const dirs = []
const walkDir = dir => {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f)

    if(shouldAddDir(dirPath)) {
      dirs.push(dirPath)
      walkDir(dirPath)
    }
  })
}


const getSubdirectories = () => {
  if(isValidSnykDirectory('./')) dirs.push('./')
  walkDir('./')
  
  return dirs.filter(dir => isValidSnykDirectory(dir))
}

module.exports = { getSubdirectories, isValidSnykDirectory }



