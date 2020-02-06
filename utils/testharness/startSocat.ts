import { IState } from './IState'
import isPortReachable from 'is-port-reachable'
import spawn from './spawn'

export default async function startSocat(state: IState, address: string): Promise<string> {
	let [host, port] = address.split(/:/)

	if (Number.isNaN(Number(port))) {
		throw new Error('Invalid port')
	}

	// Wait for remote tty to be available by listening on the tcp port
	while (
		!(await isPortReachable(Number(port), {
			host,
		}))
	) {
		console.log(`Waiting for ${address}`)
		await new Promise(resolve => setTimeout(resolve, 1000))
	}

	const link = '/tmp/ttyVACM0'
	spawn(
		state,
		'socat',
		['-d', '-d', `pty,link=${link},echo=0,raw,waitslave`, `tcp:${address}`],
		{},
	)

	return link
}
