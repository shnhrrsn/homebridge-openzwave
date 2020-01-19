import OpenZwave, {
	NodeInfo,
	Value,
	Notification,
	ControllerState,
	ValueId,
} from 'openzwave-shared'
import { Subject, ReplaySubject } from 'rxjs'
import {
	INodeStreams,
	INotificationParams,
	INodeIdParams,
	INodeInfoParams,
	IControllerCommandParams,
} from '../Streams/INodeStreams'
import { IValueParams, IValueRemovedParams } from '../Streams/IValueStreams'
import { ValueType } from '../Values/ValueType'
import { IZwave } from './IZwave'
import ValueSetter from '../Values/ValueSetter'
import stringifyValueId from '../Support/stringifyValueId'

export default class Zwave implements INodeStreams, IZwave {
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
	readonly ozw: OpenZwave
	private valueSetters = new Map<string, ValueSetter>()

	constructor(settings: Partial<OpenZwave.IConstructorParameters>) {
		this.ozw = new OpenZwave(settings)

		this.ozw.on('node removed', (nodeId: number) => {
			this.nodeRemoved.next({ nodeId })
		})

		this.ozw.on('node added', (nodeId: number) => {
			this.nodeAdded.next({ nodeId })
		})

		this.ozw.on('node reset', (nodeId: number) => this.nodeReset.next({ nodeId }))

		this.ozw.on('node ready', (nodeId: number, nodeInfo: NodeInfo) => {
			this.nodeReady.next({ nodeId, nodeInfo })
		})

		this.ozw.on('node available', (nodeId: number, nodeInfo: NodeInfo) => {
			this.nodeAvailable.next({ nodeId, nodeInfo })
		})

		this.ozw.on('value added', (nodeId: number, comClass: number, value: Value) => {
			this.valueAdded.next({ nodeId, comClass, value })
		})

		this.ozw.on('value changed', (nodeId: number, comClass: number, value: Value) => {
			this.valueChanged.next({ nodeId, comClass, value })
		})

		this.ozw.on('value refreshed', (nodeId: number, comClass: number, value: Value) => {
			this.valueRefreshed.next({ nodeId, comClass, value })
		})

		this.ozw.on(
			'value removed',
			(nodeId: number, comClass: number, instance: number, index: number) => {
				this.valueRemoved.next({ nodeId, comClass, instance, index })
			},
		)

		this.ozw.on('notification', (nodeId: number, notification: Notification, help: string) => {
			this.notification.next({ nodeId, notification, help })
		})

		this.ozw.on(
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

	refreshValue(valueId: ValueId) {
		this.ozw.refreshValue(valueId)
	}

	setValue(valueId: ValueId, value: ValueType): Promise<ValueType> {
		const key = stringifyValueId(valueId)
		let setter = this.valueSetters.get(key)

		if (!setter) {
			setter = new ValueSetter(valueId, this)
			this.valueSetters.set(key, setter)
		}

		return setter.set(value)
	}

	unsafeSetValue(valueId: ValueId, value: ValueType) {
		this.ozw.setValue(valueId, value)
	}

	getControllerNodeId() {
		return this.ozw.getControllerNodeId()
	}

	addNode(isSecure: boolean): boolean {
		return this.ozw.addNode(isSecure)
	}

	removeNode(): boolean {
		return this.ozw.removeNode()
	}

	cancelControllerCommand() {
		return this.ozw.cancelControllerCommand()
	}

	get zwave(): IZwave {
		return this
	}
}
