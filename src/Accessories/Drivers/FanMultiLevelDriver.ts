import { IDriverParams } from './Driver'
import multiLevelBinaryTransformer from '../../Values/Transformers/multiLevelBinaryTransformer'
import multiLevelTransformer from '../../Values/Transformers/multiLevelTransformer'
import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'

export default class FanMultiLevelDriver extends ManagedDriver {
	constructor(params: IDriverParams) {
		super(params)

		const value = this.values.get(0)

		if (!value) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.Fanv2)

		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		// On/Off
		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.Active,
			options: {
				transformer: multiLevelBinaryTransformer({
					truthy: (Characteristic.Active as any)?.ACTIVE ?? true,
					falsey: (Characteristic.Active as any)?.INACTIVE ?? false,
				}),
			},
		})

		// Speed
		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.RotationSpeed,
			options: {
				transformer: multiLevelTransformer(),
			},
		})
	}
}
