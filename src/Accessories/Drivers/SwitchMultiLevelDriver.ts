import registerCharacteristic from './Support/registerCharacteristic'

import Driver, { IDriverParams } from './Driver'
import multiLevelBinaryTransformer from '../../Values/Transformers/multiLevelBinaryTransformer'
import multiLevelTransformer from '../../Values/Transformers/multiLevelTransformer'
import BoundValueStream from '../../Streams/BoundValueStream'

export default class SwitchMultiLevelDriver extends Driver {
	constructor(params: IDriverParams) {
		super(params)

		const value = params.values.get(0)

		if (!value) {
			return
		}

		const { Service, Characteristic } = params.hap
		const service = params.accessory.getService(Service.Lightbulb)

		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, params.valueStreams, params.log)

		// On/Off
		registerCharacteristic({
			service,
			valueStream,
			log: params.log,
			characteristic: Characteristic.On,
			options: {
				transformer: multiLevelBinaryTransformer(),
			},
		})

		// Brightness
		registerCharacteristic({
			service,
			valueStream,
			log: params.log,
			characteristic: Characteristic.Brightness,
			options: {
				transformer: multiLevelTransformer(),
			},
		})
	}

	ready(): void {
		// TODO
	}

	destroy(): void {
		// TODO
	}
}
