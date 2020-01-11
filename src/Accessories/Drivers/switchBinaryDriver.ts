import { IDriverParams } from './Driver'
import registerCharacteristic from './Support/registerCharacteristic'

export default function switchBinaryDriver(params: IDriverParams) {
	const value = params.values.get(0)

	if (!value) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.Switch)

	if (!service) {
		return
	}

	registerCharacteristic({
		service,
		params,
		value,
		characteristic: Characteristic.On,
	})
}
