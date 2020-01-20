import Driver, { IDriverParams } from './Driver'
import registerCharacteristic from './Support/registerCharacteristic'
import BoundValueStream from '../../Streams/BoundValueStream'

export default class BatteryDriver extends Driver {
	constructor(params: IDriverParams) {
		super(params)

		const value = params.values.get(0)

		if (!value) {
			return
		}

		const { Service, Characteristic } = params.hap
		const service = params.accessory.getService(Service.BatteryService)

		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, params.valueStreams, params.log)

		registerCharacteristic({
			service,
			valueStream,
			log: params.log,
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

		registerCharacteristic({
			service,
			valueStream,
			log: params.log,
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

	ready(): void {
		// TODO
	}

	destroy(): void {
		// TODO
	}
}
