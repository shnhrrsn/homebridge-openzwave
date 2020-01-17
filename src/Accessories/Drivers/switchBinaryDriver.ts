import { IDriverParams } from './Driver'
import registerCharacteristic from './Support/registerCharacteristic'
import { BoundValueStream } from '../../Streams/BoundValueStream'

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

	const valueStream = new BoundValueStream(value, params.valueStreams, params.log)

	registerCharacteristic({
		service,
		valueStream,
		log: params.log,
		characteristic: Characteristic.On,
	})
}
