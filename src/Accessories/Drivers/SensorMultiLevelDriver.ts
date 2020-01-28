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
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)
		const unit = (value.units || 'celsius')
			.toString()
			.toUpperCase()
			.substring(0, 1)

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.CurrentTemperature,
			options: {
				// Assumes only units are C/F… No ones reporting Kelvin, right??
				transformer: unit !== 'C' ? fahrenheitToCelsiusTransformer() : undefined,
			},
		})
	}

	registerLuminance(index: number, value: Value) {
		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.LightSensor)
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.CurrentAmbientLightLevel,
		})
	}

	registerHumidity(index: number, value: Value) {
		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.HumiditySensor)
		const valueStream = new BoundValueStream(value, this.valueObservables, this.log)

		this.registerCharacteristic(index, value, {
			service,
			valueStream,
			characteristic: Characteristic.CurrentRelativeHumidity,
		})
	}
}
