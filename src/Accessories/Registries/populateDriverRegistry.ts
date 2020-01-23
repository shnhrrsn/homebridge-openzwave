import { IRegisterableDriverRegistry } from './IRegisterableDriverRegistry'
import { IDriverRegistry } from './IDriverRegistry'
import { CommandClass } from '../../Zwave/CommandClass'

import PlatformDriver from '../Drivers/PlatformDriver'
import FanMultiLevelDriver from '../Drivers/FanMultiLevelDriver'
import BatteryDriver from '../Drivers/BatteryDriver'
import SwitchBinaryDriver from '../Drivers/SwitchBinaryDriver'
import SensorMultiLevelDriver from '../Drivers/SensorMultiLevelDriver'
import SwitchMultiLevelDriver from '../Drivers/SwitchMultiLevelDriver'
import SensorBinaryDriver from '../Drivers/SensorBinaryDriver'
import PresenceBinaryDriver from '../Drivers/PresenceBinaryDriver'

export function populateDriverRegistry(registry: IRegisterableDriverRegistry): IDriverRegistry {
	// Standard drivers
	registry.register(CommandClass.BATTERY, BatteryDriver)
	registry.register(CommandClass.SENSOR_MULTILEVEL, SensorMultiLevelDriver)
	registry.register(CommandClass.SENSOR_BINARY, SensorBinaryDriver)
	registry.register(CommandClass.VIRTUAL_PRESENCE_BINARY, PresenceBinaryDriver)
	registry.register(CommandClass.SWITCH_BINARY, SwitchBinaryDriver)
	registry.register(CommandClass.SWITCH_MULTILEVEL, SwitchMultiLevelDriver)
	registry.register(CommandClass.VIRTUAL_FAN_MULTILEVEL, FanMultiLevelDriver)
	registry.register(CommandClass.VIRTUAL_PLATFORM, PlatformDriver)

	// “Remap” drivers based on hints
	registry.remap('fan', CommandClass.SWITCH_MULTILEVEL, CommandClass.VIRTUAL_FAN_MULTILEVEL)
	registry.remap('presence', CommandClass.SENSOR_BINARY, CommandClass.VIRTUAL_PRESENCE_BINARY)

	return registry
}
