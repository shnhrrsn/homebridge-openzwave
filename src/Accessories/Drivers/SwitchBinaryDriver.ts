import { IDriverParams } from './Driver'
import BoundValueStream from '../../Streams/BoundValueStream'
import ManagedDriver from './ManagedDriver'

export default class SwitchBinaryDriver extends ManagedDriver {
	constructor(params: IDriverParams) {
		super(params)

		const value = this.getValue(0)

		if (!value) {
			return
		}

		const { Service, Characteristic } = this.hap
		const service = this.accessory.getService(Service.Switch)

		if (!service) {
			return
		}

		const valueStream = new BoundValueStream(value, this.valueStreams, this.log)

		this.registerCharacteristic({
			service,
			valueStream,
			characteristic: Characteristic.On,
		})
	}
}
