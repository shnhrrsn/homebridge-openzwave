import { ChildProcessWithoutNullStreams } from 'child_process'

export interface IState {
	children: ChildProcessWithoutNullStreams[]
	exited: boolean
}
