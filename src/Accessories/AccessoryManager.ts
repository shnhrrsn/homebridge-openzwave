import Zwave from '../Zwave/Zwave'
import Platform from '../Platform'
import StandardDriverRegistry from './Registries/StandardDriverRegistry'
import loadDeviceConfig from '../Devices/loadDeviceConfig'
import mergeDeviceConfig from '../Devices/mergeDeviceConfig'
import Database from '../Support/Database'

import { Accessory, AccessoryCommands } from './Accessory'
import { IConfig } from '../IConfig'
import { IAccessoryConfig } from '../IAccessoryConfig'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo } from 'openzwave-shared'
import { INodeInfoParams, INodeIdParams } from '../Streams/INodeStreams'
import { platformName, pluginName } from '../settings'
import { CommandClass } from '../Zwave/CommandClass'
import { IValueParams } from '../Streams/IValueStreams'

export default class AccessoryManager {
	log: Homebridge.Logger
	config?: IConfig
	api: Homebridge.Api
	zwave: Zwave
	registry: Map<string, Accessory>
	nodeIdToCommandsMap: Map<number, AccessoryCommands>
	restorableAccessories: Map<string, Homebridge.PlatformAccessory>
	database: Database

	constructor(platform: Platform, database: Database) {
		if (!platform.zwave) {
			throw new Error('Platform must have zwave before creating Accessories')
		}

		this.log = platform.log
		this.config = platform.config
		this.api = platform.api
		this.zwave = platform.zwave
		this.registry = new Map()
		this.database = database
		this.nodeIdToCommandsMap = new Map()
		this.restorableAccessories = new Map()

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

	onValueAdded({ nodeId, comClass, value }: IValueParams) {
		let nodeIdToCommands = this.nodeIdToCommandsMap.get(nodeId)
		if (!nodeIdToCommands) {
			nodeIdToCommands = new Map()
			this.nodeIdToCommandsMap.set(nodeId, nodeIdToCommands)
		}

		let commands = nodeIdToCommands.get(comClass)
		if (!commands) {
			commands = new Map()
			nodeIdToCommands.set(comClass, commands)
		}

		commands.set(value.index, value)
		this.database.storeNode(nodeId, { commands: nodeIdToCommands })
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

		const commands = this.getNodeCommands(nodeId)
		this.database.storeNode(nodeId, { nodeInfo, commands })

		accessory = new Accessory(
			this.log,
			this.api,
			this.zwave,
			nodeId,
			platformAccessory,
			StandardDriverRegistry,
			commands,
			config,
		)

		if (this.restorableAccessories.delete(accessoryId)) {
			this.registry.set(accessoryId, accessory)
		}

		return accessory
	}

	private getNodeCommands(nodeId: number): AccessoryCommands {
		if (nodeId === this.zwave.getControllerNodeId()) {
			const commands: AccessoryCommands = new Map()
			commands.set(CommandClass.VIRTUAL_PLATFORM, new Map())
			return commands
		}

		return this.nodeIdToCommandsMap.get(nodeId) ?? new Map()
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
