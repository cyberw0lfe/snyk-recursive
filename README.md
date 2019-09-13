# Snyk Recursive

This package runs Snyk security scans recursively against every subdirectory containing a `node_modules` directory and a `package.json` file. 

## Usage

### Options
- `snyk-recursive` will run in 'dev mode', where the results from every scan will be printed in the terminal
- `snyk-recursive --severity=<level>` OR `snyk-recursive --severity <level>`
  - severity levels
    - `low`, `medium`, `high`
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

## Known Issues
- sometimes running Snyk through the `spawn` will cut off the output stream, causing errors in parsing the JSON response
  - When this happens in dev mode you will be prompted if you want to print the cut off response
  - If running for a build it will simply print out a message and continue analysis on the remaining packages
  - **NOTE: this almost always happens because snyk found a vulnerability and the output stream is too large for the child process, so Snyk should be run manually on any packages that fail to ensure they are secure**
  - This can be potentially addressed by tweaking the file system config with the following commands:
    - `echo kern.maxfiles=65536 | sudo tee -a /etc/sysctl.conf`
    - `echo kern.maxfilesperproc=65536 | sudo tee -a /etc/sysctl.conf`
    - `sudo sysctl -w kern.maxfiles=65536`
    - `sudo sysctl -w kern.maxfilesperproc=65536`
    - `ulimit -n 65536 65536`
    - `sudo launchctl limit maxfiles 65536 200000`
    - Source: https://wilsonmar.github.io/maximum-limits/