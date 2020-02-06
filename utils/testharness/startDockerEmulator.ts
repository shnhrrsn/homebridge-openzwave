import { IState } from './IState'
import spawn from './spawn'

export default function startDockerEmulator(state: IState): string {
	spawn(
		state,
		'docker',
		[
			'run',
			'-i',
			'--rm',
			'--name=zwave-emulator',
			'--publish=4500:4500',
			'--publish=32375:32375',
			'docker.pkg.github.com/shnhrrsn/docker-zwave-emulator/emulator:1.0',
		],
		{ name: 'zwave-emulator' },
	)

	return 'localhost:32375'
}
