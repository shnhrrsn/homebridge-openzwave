import multiLevelBinaryTransformer from '../../Values/Transformers/multiLevelBinaryTransformer'
import multiLevelTransformer from '../../Values/Transformers/multiLevelTransformer'
import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'
import { Value } from 'openzwave-shared'

export default class SwitchMultiLevelDriver extends ManagedDriver {
	addValue(index: number, value: Value) {
		if (index !== 0) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.Lightbulb)
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)

		// On/Off
		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.On,
			options: {
				transformer: multiLevelBinaryTransformer(),
			},
		})

		// Brightness
		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.Brightness,
			options: {
				transformer: multiLevelTransformer(),
			},
		})
	}
}
