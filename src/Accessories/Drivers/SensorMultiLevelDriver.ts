import { IDriverParams } from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import fahrenheitToCelsiusTransformer from '../../Values/Transformers/fahrenheitToCelsiusTransformer'
import ManagedDriver from './ManagedDriver'

export default class SensorMultiLevelDriver extends ManagedDriver {
	constructor(params: IDriverParams) {
		super(params)

		this.registerTemperature()
		this.registerLuminance()
		this.registerHumidity()
	}

	registerTemperature() {
		const value = this.values.get(1)

		if (value === undefined) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.TemperatureSensor)
		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)
		const unit = this.values.get(256)

		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.CurrentTemperature,
			options: {
				readonly: true,
				transformer:
					(unit ?? 'celsius').toString().toLowerCase() !== 'celius'
						? fahrenheitToCelsiusTransformer()
						: undefined,
			},
		})
	}

	registerLuminance() {
		const value = this.values.get(3)

		if (value === undefined) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.LightSensor)
		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.CurrentAmbientLightLevel,
			options: {
				readonly: true,
			},
		})
	}

	registerHumidity() {
		const value = this.values.get(5)

		if (value === undefined) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.HumiditySensor)
		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.CurrentRelativeHumidity,
			options: {
				readonly: true,
			},
		})
	}
}
