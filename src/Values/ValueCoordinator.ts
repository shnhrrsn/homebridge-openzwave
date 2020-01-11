import { first, filter } from 'rxjs/operators'
import { Subscription } from 'rxjs'

import { ScopedValueStream } from '../Streams/ScopedValueStream'
import { ValueId, Value, ValueType } from 'openzwave-shared'
import { IValueStream } from '../Streams/IValueStream'
import { IValueTransformer } from './IValueTransformer'

import Ozw from '../Zwave/Zwave'
import valueIdentityTransformer from './valueNoopTransformer'
import { Homebridge } from '../../types/homebridge'

export type CoordinateValuesParams = {
	log: Homebridge.Logger
	characteristic: HAPNodeJS.Characteristic
	initialValue: Value
	valueStream: IValueStream
	zwave: Ozw
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
	scopedStream?: ScopedValueStream
	valueUpdateObserver?: Subscription

	constructor({ log, characteristic, initialValue, valueStream, zwave, transformer }: CoordinateValuesParams) {
		this.log = log
		this.characteristic = characteristic
		this.initialValue = initialValue
		this.valueStream = valueStream
		this.zwave = zwave
		this.transformer = transformer ?? valueIdentityTransformer
	}

	start() {
		const scopedStream = new ScopedValueStream(this.valueId, this.valueStream)
		this.scopedStream = scopedStream

		let valueUpdate = scopedStream.valueUpdate

		if (this.transformer.isZwaveValid) {
			valueUpdate = valueUpdate.pipe(filter(({ value }) => this.transformer.isZwaveValid!(value.value)))
		}

		// Notify HomeKit of the initial value
		this.sendZwaveValueToHomeKit(this.initialValue)

		// Subscribe to all value updates and forward them to HomeKit
		this.valueUpdateObserver = valueUpdate.subscribe(({ value }) => {
			this.sendZwaveValueToHomeKit(value)
		})

		// Handle explicit HomeKit value setting
		this.characteristic.on('set', (newValue: ValueType, callback: Function) => {
			this.sendHomeKitValueToZwave(newValue, callback)
		})

		// Handle explicit HomeKit value requests
		this.characteristic.on('get', (callback?: Function) => {
			// TODO: Maybe switch to a behavior subject here?
			// Should investigate performance and see if it’s worth it

			// Since there’s no way to request a value from OZW with
			// a callback, we just listen to next value emitted on the
			// value update stream and pass that back to HomeKit
			valueUpdate.pipe(first()).subscribe(({ value }) => {
				this.sendZwaveValueToHomeKit(value, callback)

				// Protect against the possibility this fires multiple times
				callback = undefined
			})

			// Request a new value from ZWave so valueUpdate emits
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
		this.log.debug('set', homekitValue)

		if (this.transformer.isHomekitValid && !this.transformer.isHomekitValid!(homekitValue)) {
			return
		}

		this.zwave.setValue(this.valueId, this.transformer.homekitToZwave(homekitValue))
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
