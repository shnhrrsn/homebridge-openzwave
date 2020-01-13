import batteryDriver from '../Drivers/batteryDriver'
import switchBinaryDriver from '../Drivers/switchBinaryDriver'
import switchMultiLevelDriver from '../Drivers/switchMultiLevelDriver'
import platformDriver from '../Drivers/platformDriver'

import { CommandClass } from '../../Zwave/CommandClass'
import { IDriverRegistry } from './IDriverRegistry'
import fanMultiLevelDriver from '../Drivers/fanMultiLevelDriver'

const StandardDriverRegistry: IDriverRegistry = new Map()
export default StandardDriverRegistry

StandardDriverRegistry.set(CommandClass.VIRTUAL_PLATFORM, platformDriver)
StandardDriverRegistry.set(CommandClass.VIRTUAL_FAN_MULTILEVEL, fanMultiLevelDriver)

StandardDriverRegistry.set(CommandClass.BATTERY, batteryDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_BINARY, switchBinaryDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_MULTILEVEL, switchMultiLevelDriver)

Object.seal(StandardDriverRegistry)
