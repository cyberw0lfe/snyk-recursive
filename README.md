# Snyk Recursive
[![Build Status](https://travis-ci.org/adamtwolfe/snyk-recursive.svg?branch=master)](https://travis-ci.org/adamtwolfe/snyk-recursive)

This package runs Snyk security scans recursively against every subdirectory containing:
- A `node_modules` directory as well as a `package.json` file
- A pom.xml file or a gradle.build file.

## Usage
`snyk-recursive` will run in 'dev mode', where the results from every scan will be printed in the terminal. By default scans are run synchronously.
### Options
- `--v` or `--version` - log current version to the console
- `--async` - run the Snyk scans asynchronously
- `--org=<your-org>` OR `--org <your-org>`
- `--severity=<level>` OR `--severity <level>`
  - severity levels - `low`, `medium`, `high`
  - stops execution when a vulnerability at or above the security level is found
  - prints out a summary of the offending package
  - exits the process w/ a non-zero code in order to fail builds

### CLI
- Ensure you have snyk installed and set up
  - `npm install -g snyk`
  - `snyk auth`
- Install the `snyk-recursive` package
  - `npm i -g snyk-recursive`
- In the directory with subdirectories you want to test, run `snyk-recursive`

### CI/CD Integration (for monorepos)
- Install the `snyk-recursive` package as a dev-dependency to your monorepo
- Create an npm script that runs `snyk-recursive --severity=<level>`, where severity will be the threshold for failing builds
- In your CI/CD config, add a step after installing dependencies to run the npm script
- You **must** add an environment variable `SNYK_TOKEN=<token>` for snyk to authorize your pipeline to run a security scan
  - Your token can be found on your Snyk profile or using a service account