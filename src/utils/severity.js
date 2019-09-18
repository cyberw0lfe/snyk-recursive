const argv = require('yargs').argv
const { green, yellow, red, blue } = require('chalk')

const severityLevel = argv.severity

const severityLevels = {
  high: 'high',
  medium: 'medium',
  low: 'low',
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


const buildPasses = severities => {
  const { low, medium, high } = severities
  if (severityLevel === severityLevels.high && high > 0) return false
  if (severityLevel === severityLevels.medium && high + medium > 0) return false
  if (severityLevel === severityLevels.low && high + medium + low > 0) return false
  return true
}

module.exports = { countSeverityLevels, buildPasses, getSeverityColor }