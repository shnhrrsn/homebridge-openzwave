import { IRegisterableDriverRegistry } from './IRegisterableDriverRegistry'
import { CommandClass } from '../../Zwave/CommandClass'
import { DriverCreator } from './IDriverRegistry'
import { AccessoryHintType } from '../../IAccessoryConfig'
import Driver, { IDriverParams } from '../Drivers/Driver'

export default class SimpleDriverRegistry implements IRegisterableDriverRegistry {
	private registry = new Map<CommandClass, DriverCreator>()
	private hintRegistry = new Map<AccessoryHintType, Map<CommandClass, CommandClass>>()

	register(commandClass: CommandClass, driverCreator: new (params: IDriverParams) => Driver) {
		this.registry.set(commandClass, params => new driverCreator(params))
	}

	remap(hint: AccessoryHintType, fromCommandClass: CommandClass, toCommandClass: CommandClass) {
		let hintRegistry = this.hintRegistry.get(hint)

		if (!hintRegistry) {
			hintRegistry = new Map()
			this.hintRegistry.set(hint, hintRegistry)
		}

		hintRegistry.set(fromCommandClass, toCommandClass)
	}

	get(commandClass: CommandClass, hints: Set<AccessoryHintType>): DriverCreator | undefined {
		for (const hint of hints) {
			const hintedCommandClass = this.hintRegistry.get(hint)?.get(commandClass)

			if (hintedCommandClass) {
				return this.get(hintedCommandClass, hints)
			}
		}

		return this.registry.get(commandClass)
	}
}
