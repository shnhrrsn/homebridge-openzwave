require('./shared/bootstrap')
const chalk = require('chalk')
const path = require('path')

function fatal(message, ...args) {
	console.error(chalk.red(message))
	process.exit(1)
}

if (process.argv.length < 3) {
	fatal('Must have at least one argument')
}

const name = process.argv[2]
let cmd = null

try {
	cmd = require(`./cmd/${name}`).default
	if (!cmd) {
		const error = new Error()
		error.code = 'MODULE_NOT_FOUND'
	}
} catch (error) {
	if (error.code === 'MODULE_NOT_FOUND') {
		fatal(`Invalid command: ${name}`)
	}
}

Promise.resolve(cmd(...process.argv.slice(3)))
	.then(() => process.exit(0))
	.catch(error => {
		fatal(error.message, error.stack)
	})
