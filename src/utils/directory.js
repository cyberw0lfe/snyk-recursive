const fs = require('fs')
const path = require('path')
const getMonorepoPackages = require('get-monorepo-packages')

const targetFiles = ['package.json', 'package-lock.json', 'yarn.json', 'yarn.lock']
const isValidSnykDirectory = path => {
  const dirFiles = fs.readdirSync(path)
  const hasModules = dirFiles.includes('node_modules')
  const hasDepRecord = dirFiles.filter(file => targetFiles.includes(file)).length > 0
  return hasModules && hasDepRecord ? true : false
}

// const dirs = []
// const walkDir = dir => {
//   let dirs = []
  
//   fs.readdirSync(dir).forEach(f => {
//     const dirPath = path.join(dir, f)
//     const isDir = fs.statSync(dirPath).isDirectory()
//     const isNodeMod = dirPath.indexOf('node_modules') >= 0

//     if (!isNodeMod && isDir) {
//       dirs.push(dirPath)
//       const subDirs = walkDir(dirPath)
//       if(subDirs.length > 0) dirs.concat(subDirs)
//     }
//   })

//   return dirs
// }

// const getSubdirectories = () => {
//   const dirs = walkDir('./')
//   const dirs = getMonorepoPackages()
//   console.log(dirs)
//   if(isValidSnykDirectory('./')) dirs.push('./')
  
//   return dirs.filter(dir => isValidSnykDirectory(dir))
// }

const getSubdirectories = () => (
  getMonorepoPackages('./')
    .map(dir => dir.location)
    .filter(dir => dir.indexOf('node_modules') === -1 && isValidSnykDirectory(dir))
)

module.exports = { getSubdirectories, isValidSnykDirectory }