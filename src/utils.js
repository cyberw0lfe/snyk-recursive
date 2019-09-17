const chalk = require('chalk')
const globby = require('globby')

const green = chalk.green
const blue = chalk.blue
const yellow = chalk.yellow
const red = chalk.red
const snykUrl = 'https://snyk.io/vuln/'

const severityLevels = {
  high: 'high',
  medium: 'medium',
  low: 'low',
}

const getSubdirectories = () => {
  const packages = globby.sync(`./*/**/package.json`)
  const filteredPacakges = packages.filter(pkg => !/node_modules/gi.test(pkg))
  return filteredPacakges.map(path => path.replace(/\/package.json/, ''))
}

const printTestConditions = (result, severities) => {
  const color = result.ok ? green : red
  const summary = color(`found ${result.uniqueCount} issues, ${result.summary}`)
  const severites = blue(`Low - ${severities.low}, `) + yellow(`Medium - ${severities.medium}, `) + red(`High - ${severities.high}`)
  console.log(
    `Test Path: ${result.path}
Organization: ${result.org}
Package Manager: ${result.packageManager}
Tested ${result.dependencyCount} dependencies, ${summary}
${severites}\n`,
  )
}

const countSeverityLevels = result => {
  const severities = {
    low: 0,
    medium: 0,
    high: 0,
  }
  if (result.vulnerabilities.length > 0) {
    result.vulnerabilities.forEach(vulnerability => {
      const severity = vulnerability.severity
      if (severity === severityLevels.low) severities.low++
      if (severity === severityLevels.medium) severities.medium++
      if (severity === severityLevels.high) severities.high++
    })
  }

  return severities
}

const getSeverityColor = severity => {
  if (severity === severityLevels.low) return blue
  if (severity === severityLevels.medium) return yellow
  if (severity === severityLevels.high) return red
  return green
}

const printVulnerability = vulnerability => {
  const severityColor = getSeverityColor(vulnerability.severity)
  console.log(
    `Summary:    ${snykUrl.concat(vulnerability.id)}
Package:    ${vulnerability.name}
Severity:   ${severityColor(vulnerability.severity + ', ' + vulnerability.title)}
Path:       ${vulnerability.from.join(' -> ')}\n`,
  )
}

const printUniqueVulnerabilities = result => {
  const uniqueVulnerabilities = []
  result.vulnerabilities.forEach(vulnerability => {
    if (!uniqueVulnerabilities.includes(vulnerability.name)) {
      uniqueVulnerabilities.push(vulnerability.name)
      printVulnerability(vulnerability)
    }
  })
}

const printTestResult = (result, severities) => {
  console.log(`----------\n`)
  printTestConditions(result, severities)
  if (!result.ok && result.vulnerabilities.length > 0) printUniqueVulnerabilities(result)
}

const buildPasses = severities => {
  const { low, medium, high } = severities
  if (severityLevel === severityLevels.high && high > 0) return false
  if (severityLevel === severityLevels.medium && high + medium > 0) return false
  if (severityLevel === severityLevels.low && high + medium + low > 0) return false
  return true
}

module.exports = { getSubdirectories, printTestResult, countSeverityLevels, buildPasses }
