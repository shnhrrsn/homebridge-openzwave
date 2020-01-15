import OpenZwave, { Value, ValueType, ValueId } from 'openzwave-shared'

import { first, filter } from 'rxjs/operators'
import { Subscription } from 'rxjs'

import { ScopedValueStream } from '../Streams/ScopedValueStream'
import { IValueStream } from '../Streams/IValueStream'
import { IValueTransformer } from './Transformers/IValueTransformer'

import Ozw from '../Zwave/Zwave'
import noopValueTransformer from './Transformers/noopValueTransformer'
import { Homebridge } from '../../types/homebridge'

export type CoordinateValuesParams = {
	log: Homebridge.Logger
	characteristic: HAPNodeJS.Characteristic
	valueId: ValueId
	valueStream: IValueStream
	readonly?: boolean
	transformer?: IValueTransformer
}

// Coordinates value streams from both Zwave and HomeKit for a single Characteristic
export default class ValueCoordinator {
	readonly log: Homebridge.Logger
	readonly characteristic: HAPNodeJS.Characteristic
	readonly valueStream: IValueStream
	readonly transformer: IValueTransformer
	readonly readonly: boolean
	readonly valueId: ValueId
	private scopedStream?: ScopedValueStream
	private valueUpdateObserver?: Subscription

	constructor({
		log,
		characteristic,
		valueId,
		valueStream,
		readonly,
		transformer,
	}: CoordinateValuesParams) {
		this.log = log
		this.characteristic = characteristic
		this.valueId = valueId
		this.valueStream = valueStream
		this.readonly = readonly ?? false
		this.transformer = transformer ?? noopValueTransformer()

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

		// If we already have a value, send it to HomeKit
		let hadInitialValue = false
		valueUpdate
			.pipe(first())
			.subscribe(({ value }) => {
				this.sendZwaveValueToHomeKit(value)
				hadInitialValue = true
			})
			.unsubscribe()

		// Otherwise, request a refresh
		if (!hadInitialValue) {
			this.refreshZwaveValue()
		}

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

	private get zwave(): OpenZwave {
		return this.valueStream.zwave
	}
}
