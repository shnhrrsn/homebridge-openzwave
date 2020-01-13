import OpenZwave, { NodeInfo, Value, Notification, ControllerState } from 'openzwave-shared'
import { Subject, ReplaySubject } from 'rxjs'
import {
	INodeStream,
	INotificationParams,
	INodeIdParams,
	INodeInfoParams,
	IControllerCommandParams,
} from '../Streams/INodeStream'
import { IValueParams, IValueRemovedParams } from '../Streams/IValueStream'

export default class Zwave extends OpenZwave implements INodeStream {
	readonly nodeRemoved = new Subject<INodeIdParams>()
	readonly nodeAdded = new Subject<INodeIdParams>()
	readonly nodeReset = new Subject<INodeIdParams>()
	readonly nodeReady = new Subject<INodeInfoParams>()
	readonly nodeAvailable = new Subject<INodeInfoParams>()
	readonly valueAdded = new Subject<IValueParams>()
	readonly valueChanged = new ReplaySubject<IValueParams>()
	readonly valueRefreshed = new ReplaySubject<IValueParams>()
	readonly valueRemoved = new Subject<IValueRemovedParams>()
	readonly notification = new ReplaySubject<INotificationParams>()
	readonly controllerCommand = new ReplaySubject<IControllerCommandParams>()

	constructor(settings: Partial<OpenZwave.IConstructorParameters>) {
		super(settings)

		this.on('node removed', (nodeId: number) => {
			this.nodeRemoved.next({ nodeId })
		})

		this.on('node added', (nodeId: number) => {
			this.nodeAdded.next({ nodeId })
		})

		this.on('node reset', (nodeId: number) => this.nodeReset.next({ nodeId }))

		this.on('node ready', (nodeId: number, nodeInfo: NodeInfo) => {
			this.nodeReady.next({ nodeId, nodeInfo })
		})

		this.on('node available', (nodeId: number, nodeInfo: NodeInfo) => {
			this.nodeAvailable.next({ nodeId, nodeInfo })
		})

		this.on('value added', (nodeId: number, comClass: number, value: Value) => {
			this.valueAdded.next({ nodeId, comClass, value })
		})

		this.on('value changed', (nodeId: number, comClass: number, value: Value) => {
			this.valueChanged.next({ nodeId, comClass, value })
		})

		this.on('value refreshed', (nodeId: number, comClass: number, value: Value) => {
			this.valueRefreshed.next({ nodeId, comClass, value })
		})

		this.on(
			'value removed',
			(nodeId: number, comClass: number, instance: number, index: number) => {
				this.valueRemoved.next({ nodeId, comClass, instance, index })
			},
		)

		this.on('notification', (nodeId: number, notification: Notification, help: string) => {
			this.notification.next({ nodeId, notification, help })
		})

		this.on(
			'controller command',
			(
				nodeId: number,
				state: ControllerState,
				notif: number,
				message: string,
				command: number,
			) => {
				this.controllerCommand.next({
					nodeId,
					state,
					notif,
					message,
					command,
				})
			},
		)
	}
}
