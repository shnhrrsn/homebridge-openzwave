import { IDriverParams } from './Driver'
import registerCharacteristic from './Support/registerCharacteristic'
import { BoundValueStream } from '../../Streams/BoundValueStream'

export default function batteryDriver(params: IDriverParams) {
	const value = params.values.get(0)

	if (!value) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.BatteryService)

	if (!service) {
		return
	}

	const valueStream = new BoundValueStream(value, params.valueStreams)

	registerCharacteristic({
		service,
		valueStream,
		log: params.log,
		characteristic: Characteristic.BatteryLevel,
		options: {
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
			transformer: {
				zwaveToHomeKit(value) {
					return Number(value) < 20
						? ((Characteristic.StatusLowBattery as any).BATTERY_LEVEL_LOW as number)
						: ((Characteristic.StatusLowBattery as any).BATTERY_LEVEL_NORMAL as number)
				},
			},
		},
	})
}
