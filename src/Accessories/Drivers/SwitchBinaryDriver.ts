import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'
import { Value } from 'openzwave-shared'

export default class SwitchBinaryDriver extends ManagedDriver {
	addValue(index: number, value: Value) {
		if (index !== 0) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.Switch)
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.On,
		})
	}
}
