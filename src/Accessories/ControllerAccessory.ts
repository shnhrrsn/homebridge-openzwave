import { Accessory, IAccessoryParams } from './Accessory'
import { CommandClass } from '../Zwave/CommandClass'

// A special subclass of accessory for Controller nodes
// that registers the VIRTUAL_PLATFORM class
export default class ControllerAccessory extends Accessory {
	constructor(params: IAccessoryParams) {
		super(params)

		this.registerCommandClass(CommandClass.VIRTUAL_PLATFORM)
	}
}
