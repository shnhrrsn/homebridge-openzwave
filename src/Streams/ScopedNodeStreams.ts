import OpenZwave from 'openzwave-shared'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import {
	INodeStreams,
	INodeInfoParams,
	INodeIdParams,
	INotificationParams,
	IControllerCommandParams,
} from './INodeStreams'
import { IValueParams, IValueRemovedParams } from './IValueStreams'

export default class ScopedNodeStreams implements INodeStreams {
	readonly nodeAvailable: Observable<INodeInfoParams>
	readonly nodeAdded: Observable<INodeIdParams>
	readonly nodeReady: Observable<INodeInfoParams>
	readonly nodeRemoved: Observable<INodeIdParams>
	readonly nodeReset: Observable<INodeIdParams>
	readonly valueAdded: Observable<IValueParams>
	readonly valueChanged: Observable<IValueParams>
	readonly valueRefreshed: Observable<IValueParams>
	readonly valueRemoved: Observable<IValueRemovedParams>
	readonly notification: Observable<INotificationParams>
	readonly controllerCommand: Observable<IControllerCommandParams>
	private nodeStreams: INodeStreams

	constructor(nodeId: number, nodeStreams: INodeStreams) {
		this.nodeStreams = nodeStreams

		this.nodeAvailable = nodeStreams.nodeAvailable.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.nodeAdded = nodeStreams.nodeAdded.pipe(filter(params => params.nodeId === nodeId))
		this.nodeReady = nodeStreams.nodeReady.pipe(filter(params => params.nodeId === nodeId))
		this.nodeRemoved = nodeStreams.nodeRemoved.pipe(filter(params => params.nodeId === nodeId))
		this.nodeReset = nodeStreams.nodeReset.pipe(filter(params => params.nodeId === nodeId))
		this.valueAdded = nodeStreams.valueAdded.pipe(filter(params => params.nodeId === nodeId))
		this.valueChanged = nodeStreams.valueChanged.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.valueRefreshed = nodeStreams.valueRefreshed.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.valueRemoved = nodeStreams.valueRemoved.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.notification = nodeStreams.notification.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.controllerCommand = nodeStreams.controllerCommand.pipe(
			filter(params => params.nodeId === nodeId),
		)
	}

	dispose() {
		// TODO
	}

	get zwave(): OpenZwave {
		return this.nodeStreams.zwave
	}
}
