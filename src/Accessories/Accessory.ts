import { IZwave } from '../Zwave/IZwave'
import NodeScopedValueStreams from '../Streams/NodeScopedValueStreams'
import MappedValues from '../Values/MappedValues'

import { IAccessoryConfig } from '../IAccessoryConfig'
import { CommandClass } from '../Zwave/CommandClass'
import { IDriverRegistry } from './Registries/IDriverRegistry'
import { NodeInfo, Value } from 'openzwave-shared'
import { IValueStreams } from '../Streams/IValueStreams'
import makePrefixedLogger from '../Support/makePrefixedLogger'
import { Logging, API, PlatformAccessory, Service, WithUUID } from 'homebridge'

export type AccessoryCommands = Map<CommandClass, Map<number, Value>>

export class Accessory {
	nodeId: number
	platformAccessory: PlatformAccessory
	api: API
	log: Logging
	zwave: IZwave
	commands: AccessoryCommands
	valueStreams: IValueStreams
	driverRegistry: IDriverRegistry
	config: IAccessoryConfig

	constructor(
		log: Logging,
		api: API,
		zwave: IZwave,
		nodeId: number,
		platformAccessory: PlatformAccessory,
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

	getService<T extends WithUUID<typeof Service>>(
		serviceType: string | T,
		createAutomatically = true,
	): Service | undefined {
		const service = this.platformAccessory.getService(serviceType)

		if (service) {
			return service
		}

		if (!createAutomatically || typeof serviceType === 'string') {
			return undefined
		}

		return this.addService(serviceType)
	}

	addService(service: Service | typeof Service, ...constructorArgs: any[]): Service {
		return this.platformAccessory.addService(service, ...constructorArgs)
	}

	private configureInfoService(infoService: Service, nodeInfo: NodeInfo) {
		const { Characteristic } = this.api.hap
		infoService.setCharacteristic(Characteristic.Manufacturer, nodeInfo.manufacturer)
		infoService.setCharacteristic(Characteristic.Model, nodeInfo.product)
		infoService.setCharacteristic(Characteristic.SerialNumber, `NODE-${this.nodeId}`)
	}
}
