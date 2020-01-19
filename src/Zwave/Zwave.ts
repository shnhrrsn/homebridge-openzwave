import ValueSetter from '../Values/ValueSetter'
import ValueRefresher from '../Values/ValueRefresher'
import stringifyValueId from '../Support/stringifyValueId'
import makePrefixedLogger from '../Support/makePrefixedLogger'
import OpenZwave, {
	NodeInfo,
	Value,
	Notification,
	ControllerState,
	ValueId,
} from 'openzwave-shared'
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
import { Homebridge } from '../../types/homebridge'
import { Subject, ReplaySubject } from 'rxjs'

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
	readonly log: Homebridge.Logger
	private valueSetters = new Map<string, ValueSetter>()
	private valueRefreshers = new Map<string, ValueRefresher>()
	private valueLoggers = new Map<string, Homebridge.Logger>()

	constructor(log: Homebridge.Logger, settings: Partial<OpenZwave.IConstructorParameters>) {
		this.log = log
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
		const key = stringifyValueId(valueId)
		let refresher = this.valueRefreshers.get(key)

		if (!refresher) {
			refresher = new ValueRefresher(this.getValueLogger(valueId), valueId, this)
			this.valueRefreshers.set(key, refresher)
		}

		refresher.refresh()
	}

	unsafeRefreshValue(valueId: ValueId) {
		this.ozw.refreshValue(valueId)
	}

	setValue(valueId: ValueId, value: ValueType): Promise<ValueType> {
		const key = stringifyValueId(valueId)
		let setter = this.valueSetters.get(key)

		if (!setter) {
			setter = new ValueSetter(this.getValueLogger(valueId), valueId, this)
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

	private getValueLogger(valueId: ValueId): Homebridge.Logger {
		const key = stringifyValueId(valueId)
		let log = this.valueLoggers.get(key)

		if (!log) {
			log = makePrefixedLogger(this.log, String(valueId.node_id))
			this.valueLoggers.set(key, log)
		}

		return log
	}

	get zwave(): IZwave {
		return this
	}
}
