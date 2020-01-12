import Ozw from '../Zwave/Zwave'
import Platform from '../Platform'
import StandardDriverRegistry from './Registries/StandardDriverRegistry'

import { Accessory, AccessoryCommands } from './Accessory'
import { IConfig } from '../IConfig'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo } from 'openzwave-shared'
import { INodeInfoParams, INodeIdParams } from '../Streams/INodeStream'
import { platformName, pluginName } from '../settings'
import { CommandClass } from '../Zwave/CommandClass'

export default class AccessoryManager {
	log: Homebridge.Logger
	config?: IConfig
	api: Homebridge.Api
	zwave: Ozw
	registry: Map<string, Accessory>
	nodeIdToCommandsMap: Map<number, AccessoryCommands>
	restorableAccessories: Map<string, Homebridge.PlatformAccessory>

	constructor(platform: Platform) {
		if (!platform.zwave) {
			throw new Error('Platform must have zwave before creating Accessories')
		}

		this.log = platform.log
		this.config = platform.config
		this.api = platform.api
		this.zwave = platform.zwave
		this.registry = new Map()
		this.nodeIdToCommandsMap = new Map()
		this.restorableAccessories = new Map()

		this.zwave.nodeAdded.subscribe(this.onNodeAdded.bind(this))
		this.zwave.nodeRemoved.subscribe(this.onNodeRemoved.bind(this))
		this.zwave.nodeAvailable.subscribe(this.onNodeAvailable.bind(this))
		this.zwave.nodeReady.subscribe(this.onNodeReady.bind(this))
		this.zwave.valueAdded.subscribe(({ nodeId, comClass, value }) => {
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
		})
	}

	restoreAccessory(accessory: Homebridge.PlatformAccessory) {
		this.restorableAccessories.set(accessory.UUID, accessory)
	}

	onNodeAvailable({ nodeId, nodeInfo }: INodeInfoParams) {
		this.log.debug('onNodeAvailable', this.getInitialNodeName(nodeId, nodeInfo))
	}

	onNodeReady({ nodeId, nodeInfo }: INodeInfoParams) {
		this.log.debug('onNodeReady', this.getInitialNodeName(nodeId, nodeInfo))

		const accessory = this.makeAccessory(nodeId, nodeInfo)
		accessory.configure(nodeInfo)

		if (!this.registry.has(accessory.platformAccessory.UUID)) {
			this.api.registerPlatformAccessories(pluginName, platformName, [
				accessory.platformAccessory,
			])
			this.registry.set(accessory.platformAccessory.UUID, accessory)
		}
	}

	onNodeAdded({ nodeId }: INodeIdParams) {
		this.log.debug('onNodeAdded', this.getInitialNodeName(nodeId))
	}

	onNodeRemoved({ nodeId }: INodeIdParams) {
		this.log.debug('onNodeRemoved', this.getInitialNodeName(nodeId))
	}

	nodeIdToAccessoryId(nodeId: number): string {
		const uuidPrefix = this.config?.uuidPrefix ?? `${platformName}/`
		return this.api.hap.uuid.generate(uuidPrefix + String(nodeId))
	}

	private makeAccessory(nodeId: number, nodeInfo: NodeInfo): Accessory {
		const accessoryId = this.nodeIdToAccessoryId(nodeId)
		let accessory = this.registry.get(accessoryId)

		if (accessory) {
			return accessory
		}

		const config = this.config?.accessories?.[String(nodeId)]
		const platformAccessory =
			this.restorableAccessories.get(accessoryId) ||
			new this.api.platformAccessory(this.getInitialNodeName(nodeId, nodeInfo), accessoryId)

		accessory = new Accessory(
			this.log,
			this.api,
			this.zwave,
			nodeId,
			platformAccessory,
			StandardDriverRegistry,
			this.getNodeCommands(nodeId),
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
			commands.set(CommandClass.PLATFORM_RESERVED, new Map())
			return commands
		}

		return this.nodeIdToCommandsMap.get(nodeId) ?? new Map()
	}

	private getInitialNodeName(nodeId: number, nodeInfo?: NodeInfo) {
		const configName = this.config?.accessories?.[nodeId]?.name

		if (configName) {
			return configName
		}

		if (nodeId === this.zwave.getControllerNodeId()) {
			return nodeInfo?.product ?? platformName
		}

		if (!nodeInfo) {
			return `Node ${nodeId}`
		}

		return `${nodeId} / ${nodeInfo.product} - ${nodeInfo.productid}`
	}
}