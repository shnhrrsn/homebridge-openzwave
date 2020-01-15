import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { INodeStreams, IControllerCommandParams } from './INodeStreams'
import { ControllerState } from 'openzwave-shared'

const endStates = new Set([
	ControllerState.NodeOK,
	ControllerState.NodeFailed,
	ControllerState.Completed,
	ControllerState.Cancel,
	ControllerState.Error,
	ControllerState.Failed,
])

export default class ControllerCommandStreams {
	readonly change: Observable<IControllerCommandParams>
	readonly waiting: Observable<IControllerCommandParams>
	readonly end: Observable<IControllerCommandParams>

	constructor(nodeStreams: INodeStreams) {
		this.change = nodeStreams.controllerCommand
		this.waiting = nodeStreams.controllerCommand.pipe(
			filter(({ state }) => state === ControllerState.Waiting),
		)
		this.end = nodeStreams.controllerCommand.pipe(filter(({ state }) => endStates.has(state)))
	}

	dispose() {
		// TODO
	}
}
