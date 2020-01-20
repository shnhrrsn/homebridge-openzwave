import { IDriverParams } from './Driver'
import multiLevelBinaryTransformer from '../../Values/Transformers/multiLevelBinaryTransformer'
import multiLevelTransformer from '../../Values/Transformers/multiLevelTransformer'
import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'

export default class SwitchMultiLevelDriver extends ManagedDriver {
	constructor(params: IDriverParams) {
		super(params)

		const value = this.getValue(0)

		if (!value) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.Lightbulb)

		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		// On/Off
		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.On,
			options: {
				transformer: multiLevelBinaryTransformer(),
			},
		})

		// Brightness
		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.Brightness,
			options: {
				transformer: multiLevelTransformer(),
			},
		})
	}
}
