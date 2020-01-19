import registerCharacteristic from './Support/registerCharacteristic'

import { IDriverParams } from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import fahrenheitToCelsiusTransformer from '../../Values/Transformers/fahrenheitToCelsiusTransformer'

export default function sensorMultiLevelDriver(params: IDriverParams) {
	registerTemperature(params)
	registerLuminance(params)
	registerHumidity(params)
}

function registerTemperature(params: IDriverParams) {
	const value = params.values.get(1)

	if (value === undefined) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.TemperatureSensor)
	if (!service) {
		return
	}

	const valueStream = new BoundValueStream(value, params.valueStreams, params.log)
	const unit = params.values.get(256)

	registerCharacteristic({
		service,
		valueStream,
		log: params.log,
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

function registerLuminance(params: IDriverParams) {
	const value = params.values.get(3)

	if (value === undefined) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.LightSensor)
	if (!service) {
		return
	}

	const valueStream = new BoundValueStream(value, params.valueStreams, params.log)

	registerCharacteristic({
		service,
		valueStream,
		log: params.log,
		characteristic: Characteristic.CurrentAmbientLightLevel,
		options: {
			readonly: true,
		},
	})
}

function registerHumidity(params: IDriverParams) {
	const value = params.values.get(5)

	if (value === undefined) {
		return
	}

	const { Service, Characteristic } = params.hap
	const service = params.accessory.getService(Service.HumiditySensor)
	if (!service) {
		return
	}

	const valueStream = new BoundValueStream(value, params.valueStreams, params.log)

	registerCharacteristic({
		service,
		valueStream,
		log: params.log,
		characteristic: Characteristic.CurrentRelativeHumidity,
		options: {
			readonly: true,
		},
	})
}
