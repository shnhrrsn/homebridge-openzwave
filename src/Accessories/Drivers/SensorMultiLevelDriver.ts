import BoundValueStream from '../../Streams/BoundValueStream'
import fahrenheitToCelsiusTransformer from '../../Values/Transformers/fahrenheitToCelsiusTransformer'
import ManagedDriver from './ManagedDriver'
import { Value } from 'openzwave-shared'

export default class SensorMultiLevelDriver extends ManagedDriver {
	addValue(index: number, value: Value) {
		switch (index) {
			case 1:
				this.registerTemperature(index, value)
				break
			case 3:
				this.registerLuminance(index, value)
				break
			case 5:
				this.registerHumidity(index, value)
				break
		}
	}

	registerTemperature(index: number, value: Value) {
		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.TemperatureSensor)
		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)
		const unit = this.getValue(256)

		this.registerCharacteristic(index, {
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

	registerLuminance(index: number, value: Value) {
		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.LightSensor)
		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		this.registerCharacteristic(index, {
			service,
			valueStream,
			characteristic: Characteristic.CurrentAmbientLightLevel,
			options: {
				readonly: true,
			},
		})
	}

	registerHumidity(index: number, value: Value) {
		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.HumiditySensor)
		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		this.registerCharacteristic(index, {
			service,
			valueStream,
			characteristic: Characteristic.CurrentRelativeHumidity,
			options: {
				readonly: true,
			},
		})
	}
}
