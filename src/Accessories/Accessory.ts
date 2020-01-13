import Ozw from '../Zwave/Zwave'
import ScopedNodeStream from '../Streams/ScopedNodeStream'

import { IAccessoryConfig } from '../IAccessoryConfig'
import { CommandClass } from '../Zwave/CommandClass'
import { IDriverRegistry } from './Registries/IDriverRegistry'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo, Value } from 'openzwave-shared'

export type AccessoryCommands = Map<CommandClass, Map<number, Value>>

export class Accessory {
	nodeId: number
	platformAccessory: Homebridge.PlatformAccessory
	api: Homebridge.Api
	log: Homebridge.Logger
	zwave: Ozw
	commands: AccessoryCommands
	nodeStream: ScopedNodeStream
	driverRegistry: IDriverRegistry
	config: IAccessoryConfig

	constructor(
		log: Homebridge.Logger,
		api: Homebridge.Api,
		zwave: Ozw,
		nodeId: number,
		platformAccessory: Homebridge.PlatformAccessory,
		driverRegistry: IDriverRegistry,
		commands: AccessoryCommands,
		config?: IAccessoryConfig,
	) {
		this.log = log
		this.api = api
		this.zwave = zwave
		this.nodeId = nodeId
		this.platformAccessory = platformAccessory
		this.driverRegistry = driverRegistry
		this.nodeStream = new ScopedNodeStream(nodeId, this.zwave)
		this.commands = new Map(commands)
		this.config = config ?? {}
	}

	configure(nodeInfo: NodeInfo) {
		const { Service } = this.api.hap
		const infoService = this.getService(Service.AccessoryInformation, false)

		if (infoService) {
			this.configureInfoService(infoService, nodeInfo)
		}

		const ignoredCommands = new Set(this.config.commands?.ignored ?? [])

		for (const [commandClass, values] of this.commands.entries()) {
			if (ignoredCommands.has(commandClass)) {
				continue
			}

			const driver = this.driverRegistry.get(commandClass)

			if (!driver) {
				continue
			}

			driver({
				values,
				log: this.log,
				hap: this.api.hap,
				accessory: this,
				valueStream: this.nodeStream,
				hints: new Set(this.config.hints ?? []),
				zwave: this.zwave,
			})
		}
	}

	getService(
		serviceType: HAPNodeJS.PredefinedService | string,
		createAutomatically = true,
	): HAPNodeJS.Service | undefined {
		const service = this.platformAccessory.getService(serviceType)

		if (service) {
			return service
		}

		if (!createAutomatically || typeof serviceType === 'string') {
			return undefined
		}

		return this.addService(serviceType)
	}

	addService(service: HAPNodeJS.PredefinedService | HAPNodeJS.Service): HAPNodeJS.Service {
		return this.platformAccessory.addService(service)
	}

	private configureInfoService(infoService: HAPNodeJS.Service, nodeInfo: NodeInfo) {
		const { Characteristic } = this.api.hap
		infoService.setCharacteristic(<any>Characteristic.Manufacturer, nodeInfo.manufacturer)
		infoService.setCharacteristic(<any>Characteristic.Model, nodeInfo.product)
	}
}
