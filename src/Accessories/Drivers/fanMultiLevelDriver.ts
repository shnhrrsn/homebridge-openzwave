import registerCharacteristic from './Support/registerCharacteristic'

import { IDriverParams } from './Driver'
import MultiLevelBinaryTransformer from '../../Values/Transformers/MultiLevelBinaryTransformer'
import MultiLevelTransformer from '../../Values/Transformers/MultiLevelTransformer'

export default function fanMultiLevelDriver(params: IDriverParams) {
	const value = params.values.get(0)

	if (!value) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.Fanv2)

	if (!service) {
		return
	}

	// On/Off
	registerCharacteristic({
		service,
		params,
		value,
		characteristic: Characteristic.Active,
		options: {
			transformer: MultiLevelBinaryTransformer,
		},
	})

	// Speed
	registerCharacteristic({
		service,
		params,
		value: value,
		characteristic: Characteristic.RotationSpeed,
		options: {
			transformer: MultiLevelTransformer,
		},
	})
}
