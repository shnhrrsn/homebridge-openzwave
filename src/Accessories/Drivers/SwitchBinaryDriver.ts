import Driver, { IDriverParams } from './Driver'
import registerCharacteristic from './Support/registerCharacteristic'
import BoundValueStream from '../../Streams/BoundValueStream'

export default class SwitchBinaryDriver extends Driver {
	constructor(params: IDriverParams) {
		super(params)
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

	ready(): void {
		// TODO
	}

	destroy(): void {
		// TODO
	}
}
