import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'
import { Value } from 'openzwave-shared'

export default class BatteryDriver extends ManagedDriver {
	addValue(index: number, value: Value) {
		if (index !== 0) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.BatteryService)
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.BatteryLevel,
			options: {
				transformer: {
					zwaveToHomeKit(value) {
						return Math.round(Number(value))
					},
				},
			},
		})

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.StatusLowBattery,
			options: {
				transformer: {
					zwaveToHomeKit(value) {
						return Number(value) < 20
							? ((Characteristic.StatusLowBattery as any).BATTERY_LEVEL_LOW as number)
							: ((Characteristic.StatusLowBattery as any)
									.BATTERY_LEVEL_NORMAL as number)
					},
				},
			},
		})
	}
}
