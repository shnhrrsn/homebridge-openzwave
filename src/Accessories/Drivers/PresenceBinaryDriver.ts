import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'
import { Value } from 'openzwave-shared'

export default class PresenceBinaryDriver extends ManagedDriver {
	addValue(index: number, value: Value) {
		if (index !== 0) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.OccupancySensor)
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.OccupancyDetected,
			options: {
				readonly: true,
			},
		})
	}
}
