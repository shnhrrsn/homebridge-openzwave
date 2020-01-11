import { CommandClass } from '../../Zwave/CommandClass'
import { IDriverRegistry } from './IDriverRegistry'
import switchBinaryDriver from '../Drivers/SwitchBinaryDriver'
import switchMultiLevelDriver from '../Drivers/SwitchMultiLevelDriver'

const StandardDriverRegistry: IDriverRegistry = new Map()
export default StandardDriverRegistry

StandardDriverRegistry.set(CommandClass.SWITCH_BINARY, switchBinaryDriver)
StandardDriverRegistry.set(CommandClass.SWITCH_MULTILEVEL, switchMultiLevelDriver)
Object.seal(StandardDriverRegistry)
