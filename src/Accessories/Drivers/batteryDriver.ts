import { IDriverParams } from './Driver'
import registerCharacteristic from './Support/registerCharacteristic'

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

	registerCharacteristic({
		service,
		params,
		value,
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
		params,
		value,
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
