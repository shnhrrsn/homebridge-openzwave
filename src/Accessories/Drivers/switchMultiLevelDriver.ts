import registerCharacteristic from './Support/registerCharacteristic'

import { IDriverParams } from './Driver'
import { ValueType } from '../../Values/ValueType'

export default function switchMultiLevelDriver(params: IDriverParams) {
	const value = params.values.get(0)

	if (!value) {
		return
	}

	const { Service, Characteristic } = params.hap
	const isFan = params.hints.has('fan')
	const service = params.accessory.getService(isFan ? Service.Fanv2 : Service.Lightbulb)

	if (!service) {
		return
	}

	// On/Off
	registerCharacteristic({
		service,
		params,
		value,
		characteristic: isFan ? Characteristic.Active : Characteristic.On,
		options: {
			transformer: {
				homekitToZwave(homekitValue: ValueType): ValueType {
					return homekitValue ? 0xff : 0
				},
				zwaveToHomeKit(zwaveValue: ValueType): ValueType {
					return zwaveValue > 0 ? true : false
				},
			},
		},
	})

	// Intensity
	registerCharacteristic({
		service,
		params,
		value: value,
		characteristic: isFan ? Characteristic.RotationSpeed : Characteristic.Brightness,
		options: {
			transformer: {
				homekitToZwave(homekitValue: ValueType): ValueType {
					return homekitValue
				},
				zwaveToHomeKit(zwaveValue: ValueType): ValueType {
					return Math.min(99, Math.max(0, Number(zwaveValue)))
				},
				isZwaveValid(zwaveValue: ValueType) {
					return zwaveValue != 0xff
				},
			},
		},
	})
}
