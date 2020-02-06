import { IState } from './IState'
import { spawn as spawnChild } from 'child_process'
import chalk from 'chalk'

export default function spawn(
	state: IState,
	bin: string,
	args: string[],
	{ name }: { name?: string },
) {
	const child = spawnChild(bin, args, { stdio: ['ignore', 'ignore', 'inherit'] })
	name = name ?? bin
	state.children.push(child)
	child.on('exit', exitCode => {
		state.exited = true
		console.log(chalk.bgRed.black(`${name}.exit`), exitCode)
		process.exit(1)
	})
}
