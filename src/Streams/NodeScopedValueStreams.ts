import { IZwave } from '../Zwave/IZwave'
import { Observable } from 'rxjs'
import { filter } from 'rxjs/operators'
import { INodeStreams } from './INodeStreams'
import { IValueParams, IValueRemovedParams, IValueStreams } from './IValueStreams'

export default class NodeScopedValueStreams implements IValueStreams {
	readonly valueAdded: Observable<IValueParams>
	readonly valueChanged: Observable<IValueParams>
	readonly valueRefreshed: Observable<IValueParams>
	readonly valueRemoved: Observable<IValueRemovedParams>
	private nodeStreams: INodeStreams

	constructor(nodeId: number, nodeStreams: INodeStreams) {
		this.nodeStreams = nodeStreams

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
	}

	dispose() {
		// TODO
	}

	get zwave(): IZwave {
		return this.nodeStreams.zwave
	}
}
