import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import {
	INodeStream,
	INodeInfoParams,
	INodeIdParams,
	INotificationParams,
	IControllerCommandParams,
} from './INodeStream'
import { IValueParams, IValueRemovedParams } from './IValueStream'
import { ControllerState } from 'openzwave-shared'

const endStates = new Set([
	ControllerState.NodeOK,
	ControllerState.NodeFailed,
	ControllerState.Completed,
	ControllerState.Cancel,
	ControllerState.Error,
	ControllerState.Failed,
])

export default class ControllerCommandStream {
	readonly change: Observable<IControllerCommandParams>
	readonly waiting: Observable<IControllerCommandParams>
	readonly end: Observable<IControllerCommandParams>

	constructor(nodeStream: INodeStream) {
		this.change = nodeStream.controllerCommand
		this.waiting = nodeStream.controllerCommand.pipe(filter(({ state }) => state === ControllerState.Waiting))
		this.end = nodeStream.controllerCommand.pipe(filter(({ state }) => endStates.has(state)))
	}

	dispose() {
		// TODO
	}
}
