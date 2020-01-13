import { first, filter } from 'rxjs/operators'
import { Subscription } from 'rxjs'

import { ScopedValueStream } from '../Streams/ScopedValueStream'
import { ValueId, Value, ValueType } from 'openzwave-shared'
import { IValueStream } from '../Streams/IValueStream'
import { IValueTransformer } from './Transformers/IValueTransformer'

import Ozw from '../Zwave/Zwave'
import valueIdentityTransformer from './Transformers/NoopValueTransformer'
import { Homebridge } from '../../types/homebridge'

export type CoordinateValuesParams = {
	log: Homebridge.Logger
	characteristic: HAPNodeJS.Characteristic
	initialValue: Value
	valueStream: IValueStream
	zwave: Ozw
	readonly?: boolean
	transformer?: IValueTransformer
}

// Coordinates value streams from both Zwave and HomeKit for a single Characteristic
export default class ValueCoordinator {
	log: Homebridge.Logger
	characteristic: HAPNodeJS.Characteristic
	initialValue: Value<string | number | boolean>
	valueStream: IValueStream
	zwave: Ozw
	transformer: IValueTransformer
	readonly: boolean
	scopedStream?: ScopedValueStream
	valueUpdateObserver?: Subscription

	constructor({
		log,
		characteristic,
		initialValue,
		valueStream,
		zwave,
		readonly,
		transformer,
	}: CoordinateValuesParams) {
		this.log = log
		this.characteristic = characteristic
		this.initialValue = initialValue
		this.valueStream = valueStream
		this.zwave = zwave
		this.readonly = readonly ?? false
		this.transformer = transformer ?? valueIdentityTransformer

		if (!this.transformer.homekitToZwave && !this.readonly) {
			throw new Error('homekitToZwave is required for readwrite values')
		}
	}

	start() {
		const scopedStream = new ScopedValueStream(this.valueId, this.valueStream)
		this.scopedStream = scopedStream

		let valueUpdate = scopedStream.valueUpdate

		if (this.transformer.isZwaveValid) {
			valueUpdate = valueUpdate.pipe(
				filter(({ value }) => this.transformer.isZwaveValid!(value.value)),
			)
		}

		// Notify HomeKit of the initial value
		this.sendZwaveValueToHomeKit(this.initialValue)

		// Subscribe to all value updates and forward them to HomeKit
		this.valueUpdateObserver = valueUpdate.subscribe(({ value }) => {
			this.sendZwaveValueToHomeKit(value)
		})

		// Handle explicit HomeKit value setting
		if (this.readonly !== true) {
			this.characteristic.on('set', (newValue: ValueType, callback: Function) => {
				this.sendHomeKitValueToZwave(newValue, callback)
			})
		}

		// Handle explicit HomeKit value requests
		this.characteristic.on('get', (callback?: Function) => {
			// valueUpdate is a ReplaySubject, so we can respond
			// with the last cached value instantly
			valueUpdate.pipe(first()).subscribe(({ value }) => {
				this.sendZwaveValueToHomeKit(value, callback)

				// Protect against the possibility this fires multiple times
				callback = undefined
			})

			// However, we still want to grab the fresh value from
			// the device, so we’ll request a refresh and that will
			// be sent to HomeKit once it’s resolved
			this.refreshZwaveValue()
		})
	}

	stop() {
		this.valueUpdateObserver?.unsubscribe()
		this.valueUpdateObserver = undefined

		this.scopedStream?.dispose()
		this.scopedStream = undefined
	}

	private sendZwaveValueToHomeKit(value: Value, callback?: Function) {
		this.log.debug('valueUpdate', value.value)
		const homekitValue = this.transformer.zwaveToHomeKit(value.value)

		if (callback) {
			callback(null, homekitValue)
		} else {
			this.characteristic.updateValue(homekitValue)
		}
	}

	private sendHomeKitValueToZwave(homekitValue: ValueType, callback: Function) {
		if (this.readonly === true) {
			return
		}

		this.log.debug('set', homekitValue)

		if (this.transformer.isHomekitValid && !this.transformer.isHomekitValid!(homekitValue)) {
			return
		}

		// NOTE: Constructor ensures homekitToZwave is available
		this.zwave.setValue(this.valueId, this.transformer.homekitToZwave!(homekitValue))

		setTimeout(callback, 1000) // TODO
		setTimeout(this.refreshZwaveValue.bind(this), 5000)
	}

	private refreshZwaveValue() {
		this.zwave.refreshValue(this.valueId)
	}

	get valueId(): ValueId {
		return this.initialValue
	}
}
