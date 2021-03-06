import { IZwave } from '../src/Zwave/IZwave'
import { Subject } from 'rxjs'
import { IValueParams, IValueRemovedParams } from '../src/Streams/IValueStreams'
import {
	INodeInfoParams,
	INodeIdParams,
	INotificationParams,
	IControllerCommandParams,
	INodeEventParams,
} from '../src/Streams/INodeStreams'
import { ValueId } from 'openzwave-shared'
import { ValueType } from '../src/Values/ValueType'
import ValueSetter from '../src/Values/ValueSetter'
import stringifyValueId from '../src/Support/stringifyValueId'
import MockNoopLogger from './MockNoopLogger'
import ValueRefresher from '../src/Values/ValueRefresher'
import ZwaveCache from '../src/Zwave/ZwaveCache'

export interface MockZwaveParams {
	handleRefreshValue(valueId: ValueId): void
	handleSetValue(valueId: ValueId, value: ValueType): void
}

export default class MockZwave implements IZwave {
	readonly valueAdded = new Subject<IValueParams>()
	readonly valueChanged = new Subject<IValueParams>()
	readonly valueRefreshed = new Subject<IValueParams>()
	readonly valueRemoved = new Subject<IValueRemovedParams>()
	readonly nodeAvailable = new Subject<INodeInfoParams>()
	readonly nodeAdded = new Subject<INodeIdParams>()
	readonly nodeReady = new Subject<INodeInfoParams>()
	readonly nodeRemoved = new Subject<INodeIdParams>()
	readonly nodeReset = new Subject<INodeIdParams>()
	readonly notification = new Subject<INotificationParams>()
	readonly nodeEvent = new Subject<INodeEventParams>()
	readonly controllerCommand = new Subject<IControllerCommandParams>()
	readonly cache = new ZwaveCache()
	private valueSetters = new Map<string, ValueSetter>()
	private valueRefreshers = new Map<string, ValueRefresher>()
	private params: MockZwaveParams

	constructor(params: MockZwaveParams) {
		this.params = params
	}

	get zwave(): IZwave {
		return this
	}

	refreshValue(valueId: ValueId, reason: string): void {
		const key = stringifyValueId(valueId)
		let refresher = this.valueRefreshers.get(key)

		if (!refresher) {
			refresher = new ValueRefresher(new MockNoopLogger(), valueId, this)
			this.valueRefreshers.set(key, refresher)
		}

		refresher.refresh(reason)
	}

	unsafeRefreshValue(valueId: ValueId): void {
		this.params.handleRefreshValue(valueId)
	}

	setValue(valueId: ValueId, value: ValueType): Promise<ValueType> {
		const key = stringifyValueId(valueId)
		let setter = this.valueSetters.get(key)

		if (!setter) {
			setter = new ValueSetter(new MockNoopLogger(), valueId, this)
			this.valueSetters.set(key, setter)
		}

		return setter.set(value)
	}

	unsafeSetValue(valueId: ValueId, value: ValueType) {
		this.params.handleSetValue(valueId, value)
	}

	getControllerNodeId(): number {
		return 1
	}

	isNodeListeningDevice(nodeId: number): boolean {
		return true
	}
}
