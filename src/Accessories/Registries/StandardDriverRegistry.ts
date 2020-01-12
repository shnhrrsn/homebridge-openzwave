import batteryDriver from '../Drivers/batteryDriver'
import switchBinaryDriver from '../Drivers/switchBinaryDriver'
import switchMultiLevelDriver from '../Drivers/switchMultiLevelDriver'
import platformDriver from '../Drivers/platformDriver'

import { CommandClass } from '../../Zwave/CommandClass'
import { IDriverRegistry } from './IDriverRegistry'

const StandardDriverRegistry: IDriverRegistry = new Map()
export default StandardDriverRegistry

StandardDriverRegistry.set(CommandClass.PLATFORM_RESERVED, platformDriver)

StandardDriverRegistry.set(CommandClass.BATTERY, batteryDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_BINARY, switchBinaryDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_MULTILEVEL, switchMultiLevelDriver)

Object.seal(StandardDriverRegistry)
