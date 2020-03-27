import { IZwave } from '../Zwave/IZwave'
import { IAccessoryConfig, AccessoryHintType } from '../IAccessoryConfig'
import { CommandClass } from '../Zwave/CommandClass'
import { IDriverRegistry } from './Registries/IDriverRegistry'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo, Value } from 'openzwave-shared'
import { IValueObservables } from '../Values/IValueObservables'
import { distinct } from 'rxjs/operators'

import makePrefixedLogger from '../Support/makePrefixedLogger'
import MappedValueIndexes from '../Values/Indexes/MappedValueIndexes'
import NoopValueIndexes from '../Values/Indexes/NoopValueIndexes'

export type AccessoryCommands = Map<CommandClass, Map<number, Value>>
export interface IAccessoryParams {
	log: Homebridge.Logger
	api: Homebridge.Api
	zwave: IZwave
	nodeId: number
	platformAccessory: Homebridge.PlatformAccessory
	driverRegistry: IDriverRegistry
	valueObservables: IValueObservables
	config?: IAccessoryConfig
}

export class Accessory {
	nodeId: number
	platformAccessory: Homebridge.PlatformAccessory
	api: Homebridge.Api
	log: Homebridge.Logger
	zwave: IZwave
	valueObservables: IValueObservables
	driverRegistry: IDriverRegistry
	config: IAccessoryConfig
	ignoredCommands: Set<CommandClass>
	prefixedLog: Homebridge.Logger
	hints: Set<AccessoryHintType>
	isListeningDevice: boolean

	constructor(params: IAccessoryParams) {
		this.log = params.log
		this.api = params.api
		this.zwave = params.zwave
		this.nodeId = params.nodeId
		this.platformAccessory = params.platformAccessory
		this.driverRegistry = params.driverRegistry
		this.valueObservables = params.valueObservables
		this.config = params.config ?? {}
		this.ignoredCommands = new Set(this.config.commands?.ignored ?? [])
		this.prefixedLog = makePrefixedLogger(this.log, `node ${this.nodeId}`)
		this.hints = new Set(this.config.hints ?? [])
		this.isListeningDevice = this.zwave.isNodeListeningDevice(this.nodeId)
	}

	configure(nodeInfo: NodeInfo) {
		const { Service } = this.api.hap
		const infoService = this.getService(Service.AccessoryInformation, false)

		if (infoService) {
			this.configureInfoService(infoService, nodeInfo)
		}

		this.valueObservables.additions
			.pipe(distinct(value => value.class_id))
			.subscribe(({ class_id: commandClass }) => {
				this.registerCommandClass(commandClass)
			})

		this.log.info(`Node Available: ${this.platformAccessory.displayName}`)
	}

	registerCommandClass(commandClass: CommandClass) {
		if (this.ignoredCommands.has(commandClass)) {
			return
		}

		const rewrite = this.config.commands?.rewrite?.find(({ from }) => from === commandClass)
		const driver = this.driverRegistry.get(rewrite?.to ?? commandClass, this.hints)

		if (!driver) {
			return
		}

		const indexes = rewrite?.indexes

		driver({
			commandClass,
			hints: this.hints,
			log: this.prefixedLog,
			indexes: indexes ? new MappedValueIndexes(indexes) : new NoopValueIndexes(),
			hap: this.api.hap,
			accessory: this,
			valueObservables: this.valueObservables.filter(
				value => value.class_id === commandClass,
			),
			zwave: this.zwave,
		}).ready()
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
		infoService.setCharacteristic(<any>Characteristic.SerialNumber, `NODE-${this.nodeId}`)
	}
}
