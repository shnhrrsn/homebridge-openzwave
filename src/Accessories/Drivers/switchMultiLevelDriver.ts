import registerCharacteristic from './Support/registerCharacteristic'

import { IDriverParams } from './Driver'
import MultiLevelBinaryTransformer from '../../Values/Transformers/MultiLevelBinaryTransformer'
import MultiLevelTransformer from '../../Values/Transformers/MultiLevelTransformer'

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
			transformer: MultiLevelBinaryTransformer,
		},
	})

	// Intensity
	registerCharacteristic({
		service,
		params,
		value: value,
		characteristic: isFan ? Characteristic.RotationSpeed : Characteristic.Brightness,
		options: {
			transformer: MultiLevelTransformer,
		},
	})
}
