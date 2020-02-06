import nopt from 'nopt'
import startDockerEmulator from '../testharness/startDockerEmulator'
import startSocat from '../testharness/startSocat'
import startTestHarness from '../testharness/startTestHarness'
import registerCleanup from '../testharness/registerCleanup'
import { IState } from '../testharness/IState'

export default async function testharness() {
	let { docker, remote, tty } = parseOptions()
	const state: IState = {
		children: [],
		exited: false,
	}

	if (docker) {
		remote = startDockerEmulator(state)
	}

	if (remote) {
		tty = await startSocat(state, remote)
	}

	registerCleanup(state)

	return startTestHarness(typeof tty === 'string' ? tty : undefined)
}

function parseOptions(): { docker?: boolean; remote?: string; tty?: string | boolean } {
	let { docker, remote, tty } = nopt(
		{
			docker: [Boolean, null],
			remote: [String, null],
			tty: [String, Boolean, null],
		},
		null,
		process.argv,
		3,
	)

	if (!docker && !remote && !tty) {
		tty = true
	}

	if ([docker, remote, tty].filter(option => !!option).length > 1) {
		throw new Error('Only one option can be specified: tty, remote or docker')
	}

	return { docker, remote, tty }
}
