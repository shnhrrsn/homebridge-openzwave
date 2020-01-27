import Zwave from '../Zwave/Zwave'
import Platform from '../Platform'
import Database from '../Support/Database'
import ValueSubjects from '../Values/ValueSubjects'
import ControllerAccessory from './ControllerAccessory'
import loadDeviceConfig from '../Devices/loadDeviceConfig'
import mergeDeviceConfig from '../Devices/mergeDeviceConfig'

import { Accessory, IAccessoryParams } from './Accessory'
import { IConfig } from '../IConfig'
import { IAccessoryConfig } from '../IAccessoryConfig'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo } from 'openzwave-shared'
import { INodeInfoParams, INodeIdParams } from '../Streams/INodeStreams'
import { platformName, pluginName } from '../settings'
import { IValueParams } from '../Streams/IValueStreams'
import { IDriverRegistry } from './Registries/IDriverRegistry'

export default class AccessoryManager {
	private readonly log: Homebridge.Logger
	private readonly config?: IConfig
	private readonly api: Homebridge.Api
	private readonly zwave: Zwave
	private readonly registry = new Map<string, Accessory>()
	private readonly restorableAccessories = new Map<string, Homebridge.PlatformAccessory>()
	private readonly database: Database
	private readonly driverRegistry: IDriverRegistry
	private readonly valueSubjects: ValueSubjects

	constructor(platform: Platform, database: Database) {
		if (!platform.zwave) {
			throw new Error('Platform must have zwave before creating Accessories')
		}

		this.log = platform.log
		this.config = platform.config
		this.api = platform.api
		this.zwave = platform.zwave
		this.database = database
		this.driverRegistry = platform.driverRegistry
		this.valueSubjects = new ValueSubjects(platform.zwave)

		this.zwave.nodeAdded.subscribe(this.onNodeAdded.bind(this))
		this.zwave.nodeRemoved.subscribe(this.onNodeRemoved.bind(this))
		this.zwave.nodeAvailable.subscribe(this.onNodeAvailable.bind(this))
		this.zwave.nodeReady.subscribe(this.onNodeReady.bind(this))
		this.zwave.valueAdded.subscribe(this.onValueAdded.bind(this))
	}

	purge() {
		if (!this.config) {
			return
		}

		for (const [nodeId, config] of Object.entries(this.config)) {
			if (config !== false) {
				continue
			}

			this.removeAccessory(this.nodeIdToAccessoryId(Number(nodeId)))
		}
	}

	restoreAccessory(accessory: Homebridge.PlatformAccessory) {
		this.restorableAccessories.set(accessory.UUID, accessory)
	}

	removeAccessory(accessoryId: string) {
		const accessory =
			this.restorableAccessories.get(accessoryId) ??
			this.registry.get(accessoryId)?.platformAccessory

		if (!accessory) {
			return
		}

		this.registry.get(accessoryId)?.prepareForRemoval()
		this.api.unregisterPlatformAccessories(pluginName, platformName, [accessory])
		this.restorableAccessories.delete(accessoryId)
		this.registry.delete(accessoryId)
	}

	onNodeAvailable({ nodeId, nodeInfo }: INodeInfoParams) {
		this.log.debug(
			'onNodeAvailable',
			this.getInitialNodeName(nodeId, nodeInfo),
			`${nodeInfo.manufacturerid}/${nodeInfo.productid}`,
		)

		this.database.storeNode(nodeId, { nodeInfo })
	}

	onNodeReady({ nodeId, nodeInfo }: INodeInfoParams) {
		const nodeName = this.getInitialNodeName(nodeId, nodeInfo)
		this.database.storeNode(nodeId, { nodeInfo })
		this.log.debug('onNodeReady', nodeName)

		const config = this.config?.accessories?.[String(nodeId)]

		if (config === false) {
			this.log.info(`Ignoring ${nodeName}`)
			return
		}

		this.makeAccessory(nodeId, nodeInfo, config)
			.then(accessory => {
				accessory.configure(nodeInfo)

				if (this.registry.has(accessory.platformAccessory.UUID)) {
					return
				}

				this.api.registerPlatformAccessories(pluginName, platformName, [
					accessory.platformAccessory,
				])
				this.registry.set(accessory.platformAccessory.UUID, accessory)
			})
			.catch(error => {
				this.log.error('Failed to make accessory', error)
			})
	}

	onNodeAdded({ nodeId }: INodeIdParams) {
		this.log.debug('onNodeAdded', this.getInitialNodeName(nodeId))
	}

	onNodeRemoved({ nodeId }: INodeIdParams) {
		this.log.debug('onNodeRemoved', this.getInitialNodeName(nodeId))
		this.removeAccessory(this.nodeIdToAccessoryId(nodeId))
	}

	onValueAdded({ nodeId, classId, value }: IValueParams) {
		// Noop
	}

	nodeIdToAccessoryId(nodeId: number): string {
		const uuidPrefix = this.config?.uuidPrefix ?? `${platformName}/`
		return this.api.hap.uuid.generate(uuidPrefix + String(nodeId))
	}

	private async makeAccessory(
		nodeId: number,
		nodeInfo: NodeInfo,
		config: IAccessoryConfig | undefined,
	): Promise<Accessory> {
		const accessoryId = this.nodeIdToAccessoryId(nodeId)
		let accessory = this.registry.get(accessoryId)

		if (accessory) {
			return accessory
		}

		const deviceConfig = await loadDeviceConfig(nodeInfo)

		if (deviceConfig) {
			if (!config) {
				config = deviceConfig
			} else {
				config = mergeDeviceConfig(config, deviceConfig)
			}
		}

		const platformAccessory =
			this.restorableAccessories.get(accessoryId) ||
			new this.api.platformAccessory(this.getInitialNodeName(nodeId, nodeInfo), accessoryId)

		this.database.storeNode(nodeId, { nodeInfo })

		const params: IAccessoryParams = {
			config,
			nodeId,
			platformAccessory,
			log: this.log,
			api: this.api,
			zwave: this.zwave,
			driverRegistry: this.driverRegistry,
			valueObservables: this.valueSubjects.filter(value => value.node_id === nodeId),
		}

		if (nodeId === this.zwave.getControllerNodeId()) {
			accessory = new ControllerAccessory(params)
		} else {
			accessory = new Accessory(params)
		}

		if (this.restorableAccessories.delete(accessoryId)) {
			this.registry.set(accessoryId, accessory)
		}

		return accessory
	}

	private getInitialNodeName(nodeId: number, nodeInfo?: NodeInfo) {
		const config = this.config?.accessories?.[nodeId]

		if (config && config.name) {
			return config.name
		}

		if (nodeId === this.zwave.getControllerNodeId()) {
			return nodeInfo?.product ?? platformName
		}

		if (!nodeInfo) {
			return `Node ${nodeId}`
		}

		return `${nodeId} - ${nodeInfo.product} (${nodeInfo.productid})`
	}
}
