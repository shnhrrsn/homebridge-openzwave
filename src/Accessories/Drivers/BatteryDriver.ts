import { IDriverParams } from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'

export default class BatteryDriver extends ManagedDriver {
	constructor(params: IDriverParams) {
		super(params)

		const value = this.getValue(0)

		if (!value) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.BatteryService)

		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.BatteryLevel,
			options: {
				readonly: true,
				transformer: {
					zwaveToHomeKit(value) {
						return Math.round(Number(value))
					},
				},
			},
		})

		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.StatusLowBattery,
			options: {
				readonly: true,
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
