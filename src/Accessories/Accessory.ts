import { IZwave } from '../Zwave/IZwave'
import NodeScopedValueStreams from '../Streams/NodeScopedValueStreams'
import MappedValues from '../Values/MappedValues'

import { IAccessoryConfig } from '../IAccessoryConfig'
import { CommandClass } from '../Zwave/CommandClass'
import { IDriverRegistry } from './Registries/IDriverRegistry'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo, Value } from 'openzwave-shared'
import { IValueStreams } from '../Streams/IValueStreams'
import makePrefixedLogger from '../Support/makePrefixedLogger'

export type AccessoryCommands = Map<CommandClass, Map<number, Value>>

export class Accessory {
	nodeId: number
	platformAccessory: Homebridge.PlatformAccessory
	api: Homebridge.Api
	log: Homebridge.Logger
	zwave: IZwave
	commands: AccessoryCommands
	valueStreams: IValueStreams
	driverRegistry: IDriverRegistry
	config: IAccessoryConfig

	constructor(
		log: Homebridge.Logger,
		api: Homebridge.Api,
		zwave: IZwave,
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
		this.valueStreams = new NodeScopedValueStreams(nodeId, zwave)
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
		const log = makePrefixedLogger(this.log, `node ${this.nodeId}`)

		for (const [commandClass, values] of this.commands.entries()) {
			if (ignoredCommands.has(commandClass)) {
				continue
			}

			const rewrite = this.config.commands?.rewrite?.find(({ from }) => from === commandClass)
			const driver = this.driverRegistry.get(rewrite?.to ?? commandClass)

			if (!driver) {
				continue
			}

			const indexes = rewrite?.indexes

			driver({
				log,
				values: indexes ? new MappedValues(indexes, values) : values,
				hap: this.api.hap,
				accessory: this,
				valueStreams: this.valueStreams,
				hints: new Set(this.config.hints ?? []),
				zwave: this.zwave,
			})
		}

		this.log.info(`Node Available: ${this.platformAccessory.displayName}`)
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
