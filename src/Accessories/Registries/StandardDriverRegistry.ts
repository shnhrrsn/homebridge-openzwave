import batteryDriver from '../Drivers/batteryDriver'
import switchBinaryDriver from '../Drivers/switchBinaryDriver'
import switchMultiLevelDriver from '../Drivers/switchMultiLevelDriver'
import platformDriver from '../Drivers/platformDriver'

import { CommandClass } from '../../Zwave/CommandClass'
import { IDriverRegistry } from './IDriverRegistry'
import fanMultiLevelDriver from '../Drivers/fanMultiLevelDriver'
import sensorMultiLevelDriver from '../Drivers/sensorMultiLevelDriver'

const StandardDriverRegistry: IDriverRegistry = new Map()
export default StandardDriverRegistry

StandardDriverRegistry.set(CommandClass.VIRTUAL_PLATFORM, platformDriver)
StandardDriverRegistry.set(CommandClass.VIRTUAL_FAN_MULTILEVEL, fanMultiLevelDriver)

StandardDriverRegistry.set(CommandClass.BATTERY, batteryDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_BINARY, switchBinaryDriver)

StandardDriverRegistry.set(CommandClass.SWITCH_MULTILEVEL, switchMultiLevelDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_MULTILEVEL_V2, switchMultiLevelDriver)

StandardDriverRegistry.set(CommandClass.SENSOR_MULTILEVEL, sensorMultiLevelDriver)
StandardDriverRegistry.set(CommandClass.SENSOR_MULTILEVEL_V2, sensorMultiLevelDriver)

Object.seal(StandardDriverRegistry)
