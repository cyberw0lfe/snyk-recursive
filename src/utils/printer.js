const { green, yellow, red, blue } = require('chalk')
const {getSeverityColor } = require('./severity')

const snykUrl = 'https://snyk.io/vuln/'

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

module.exports = { printTestResult }