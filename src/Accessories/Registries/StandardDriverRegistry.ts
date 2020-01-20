import BatteryDriver from '../Drivers/BatteryDriver'
import { CommandClass } from '../../Zwave/CommandClass'
import { IDriverRegistry } from './IDriverRegistry'
import FanMultiLevelDriver from '../Drivers/FanMultiLevelDriver'
import PlatformDriver from '../Drivers/PlatformDriver'
import SensorMultiLevelDriver from '../Drivers/SensorMultiLevelDriver'
import SwitchBinaryDriver from '../Drivers/SwitchBinaryDriver'
import SwitchMultiLevelDriver from '../Drivers/SwitchMultiLevelDriver'

const StandardDriverRegistry: IDriverRegistry = new Map()
export default StandardDriverRegistry

StandardDriverRegistry.set(CommandClass.VIRTUAL_PLATFORM, params => {
	return new PlatformDriver(params)
})
	.set(CommandClass.VIRTUAL_FAN_MULTILEVEL, params => new FanMultiLevelDriver(params))
	.set(CommandClass.BATTERY, params => new BatteryDriver(params))
	.set(CommandClass.SWITCH_BINARY, params => new SwitchBinaryDriver(params))
	.set(CommandClass.SENSOR_MULTILEVEL, params => new SensorMultiLevelDriver(params))
	.set(CommandClass.SWITCH_MULTILEVEL, params => {
		if (params.hints.has('fan')) {
			new FanMultiLevelDriver(params)
		}

		return new SwitchMultiLevelDriver(params)
	})

Object.seal(StandardDriverRegistry)
