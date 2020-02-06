import { IState } from './IState'
import chalk from 'chalk'

export default function registerCleanup(state: IState) {
	// Make sure we exit cleanly
	process.on('exit', exitCode => {
		if (state.exited) {
			return
		}

		console.log(chalk.bgRed.black('process.exit'), exitCode)
		cleanupChildren(state, exitCode)
	})

	process.on('SIGINT', () => {
		state.exited = true
		console.log(chalk.bgYellow.black('% SIGINT'))
		cleanupChildren(state, 1)
		process.exit(1)
	})
}

function cleanupChildren(state: IState, code: number) {
	for (const child of state.children) {
		child.kill(code)
	}
}
