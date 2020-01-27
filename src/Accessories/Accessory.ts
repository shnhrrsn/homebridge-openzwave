import { IZwave } from '../Zwave/IZwave'

import { IAccessoryConfig } from '../IAccessoryConfig'
import { CommandClass } from '../Zwave/CommandClass'
import { IDriverRegistry } from './Registries/IDriverRegistry'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo, Value } from 'openzwave-shared'
import { IValueObservables } from '../Values/IValueObservables'
import makePrefixedLogger from '../Support/makePrefixedLogger'
import MappedValueIndexes from '../Values/Indexes/MappedValueIndexes'
import NoopValueIndexes from '../Values/Indexes/NoopValueIndexes'
import ValueSubjects from '../Values/ValueSubjects'

export type AccessoryCommands = Map<CommandClass, Map<number, Value>>

export class Accessory {
	nodeId: number
	platformAccessory: Homebridge.PlatformAccessory
	api: Homebridge.Api
	log: Homebridge.Logger
	zwave: IZwave
	commands: AccessoryCommands
	valueObservables: IValueObservables
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
		this.valueObservables = new ValueSubjects(zwave).filter(value => value.node_id === nodeId)
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

			const hints = new Set(this.config.hints ?? [])
			const rewrite = this.config.commands?.rewrite?.find(({ from }) => from === commandClass)
			const driver = this.driverRegistry.get(rewrite?.to ?? commandClass, hints)

			if (!driver) {
				continue
			}

			const indexes = rewrite?.indexes

			driver({
				log,
				commandClass,
				hints,
				indexes: indexes ? new MappedValueIndexes(indexes) : new NoopValueIndexes(),
				prefetchedValues: Array.from(values.values()),
				hap: this.api.hap,
				accessory: this,
				valueObservables: this.valueObservables,
				zwave: this.zwave,
			}).ready()
		}

		this.log.info(`Node Available: ${this.platformAccessory.displayName}`)
	}

	prepareForRemoval() {
		//
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
