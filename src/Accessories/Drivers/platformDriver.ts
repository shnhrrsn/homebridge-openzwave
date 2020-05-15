import ControllerCommandStreams from '../../Streams/ControllerCommandStreams'

import { IDriverParams } from './Driver'
import { ValueType } from '../../Values/ValueType'
import { first } from 'rxjs/operators'
import { CharacteristicEventTypes } from 'homebridge'

// Platform specific driver to create switches within HomeKit
// to allow users to add/remove nodes
export default function platformDriver(params: IDriverParams) {
	const stream = new ControllerCommandStreams(params.zwave)

	createPlatformSwitch(params, stream, 'Add Node', () => {
		params.zwave.addNode?.()
	})

	createPlatformSwitch(params, stream, 'Add Secure Node', () => {
		params.zwave.addNode?.(true)
	})

	createPlatformSwitch(params, stream, 'Remove Node', () => {
		params.zwave.removeNode?.()
	})
}

function createPlatformSwitch(
	params: IDriverParams,
	stream: ControllerCommandStreams,
	title: string,
	handler: Function,
) {
	const { Service, Characteristic } = params.hap
	let service = params.accessory.getService(title)

	if (!service) {
		service = params.accessory.addService(new Service.Switch(title, title.toLowerCase()))
	}

	const characteristic = service.getCharacteristic(Characteristic.On)

	if (!characteristic) {
		return
	}

	let isOn = false

	characteristic.on(CharacteristicEventTypes.GET, (callback: Function) => {
		setTimeout(() => callback(isOn), 1000)
	})

	characteristic.on(CharacteristicEventTypes.SET, (value: ValueType, callback?: Function) => {
		if (value === isOn) {
			return callback?.()
		}

		if (!value) {
			params.zwave.cancelControllerCommand?.()
			return callback?.()
		}

		stream.waiting.pipe(first()).subscribe(() => {
			isOn = true
			callback?.()
			callback = undefined
		})

		stream.end.pipe(first()).subscribe(() => {
			isOn = false
			characteristic.updateValue(false)
			callback?.()
			callback = undefined
		})

		handler()
	})
}
