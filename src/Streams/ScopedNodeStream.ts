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

export default class ScopedNodeStream implements INodeStream {
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

	constructor(nodeId: number, nodeStream: INodeStream) {
		this.nodeAvailable = nodeStream.nodeAvailable.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.nodeAdded = nodeStream.nodeAdded.pipe(filter(params => params.nodeId === nodeId))
		this.nodeReady = nodeStream.nodeReady.pipe(filter(params => params.nodeId === nodeId))
		this.nodeRemoved = nodeStream.nodeRemoved.pipe(filter(params => params.nodeId === nodeId))
		this.nodeReset = nodeStream.nodeReset.pipe(filter(params => params.nodeId === nodeId))
		this.valueAdded = nodeStream.valueAdded.pipe(filter(params => params.nodeId === nodeId))
		this.valueChanged = nodeStream.valueChanged.pipe(filter(params => params.nodeId === nodeId))
		this.valueRefreshed = nodeStream.valueRefreshed.pipe(
			filter(params => params.nodeId === nodeId),
		)
		this.valueRemoved = nodeStream.valueRemoved.pipe(filter(params => params.nodeId === nodeId))
		this.notification = nodeStream.notification.pipe(filter(params => params.nodeId === nodeId))
		this.controllerCommand = nodeStream.controllerCommand.pipe(
			filter(params => params.nodeId === nodeId),
		)
	}

	dispose() {
		// TODO
	}
}
