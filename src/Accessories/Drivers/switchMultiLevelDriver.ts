import registerCharacteristic from './Support/registerCharacteristic'

import { IDriverParams } from './Driver'
import multiLevelBinaryTransformer from '../../Values/Transformers/multiLevelBinaryTransformer'
import multiLevelTransformer from '../../Values/Transformers/multiLevelTransformer'
import fanMultiLevelDriver from './fanMultiLevelDriver'

export default function switchMultiLevelDriver(params: IDriverParams) {
	if (params.hints.has('fan')) {
		return fanMultiLevelDriver(params)
	}

	const value = params.values.get(0)

	if (!value) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.Lightbulb)

	if (!service) {
		return
	}

	// On/Off
	registerCharacteristic({
		service,
		params,
		value,
		characteristic: Characteristic.On,
		options: {
			transformer: multiLevelBinaryTransformer(),
		},
	})

	// Brightness
	registerCharacteristic({
		service,
		params,
		value: value,
		characteristic: Characteristic.Brightness,
		options: {
			transformer: multiLevelTransformer(),
		},
	})
}
