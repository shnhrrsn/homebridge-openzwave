import { promisify } from 'util'
import { Homebridge } from '../../types/homebridge'
import { NodeInfo } from 'openzwave-shared'
import { AccessoryCommands } from '../Accessories/Accessory'
import fs from 'fs'
import * as JsonMap from '../Support/JsonMap'

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)

export interface IDatabaseNodeStorage {
	nodeInfo: NodeInfo
	commands: AccessoryCommands
}

export interface IDatabaseStorage {
	nodes: Map<number, Partial<IDatabaseNodeStorage>>
}

export default class Database {
	private log: Homebridge.Logger
	private databasePath: string
	private storage: Partial<IDatabaseStorage> = {}
	private saveTimeout?: NodeJS.Timeout

	constructor(log: Homebridge.Logger, databasePath: string) {
		this.log = log
		this.databasePath = databasePath
	}

	async load() {
		try {
			this.storage = JsonMap.parse((await readFileAsync(this.databasePath)) as any)
		} catch (error) {
			this.storage = {}
			if (error.code === 'ENOENT') {
				return
			}

			this.log.error('Failed to load database', error)
		}
	}

	storeNode(nodeId: number, storage: Partial<IDatabaseNodeStorage>) {
		if (!this.storage.nodes) {
			this.storage.nodes = new Map()
		}

		let nodeStorage = this.storage.nodes.get(nodeId)

		if (!nodeStorage) {
			nodeStorage = {}
			this.storage.nodes.set(nodeId, nodeStorage)
		}

		Object.assign(nodeStorage, storage)
		this.scheduleSave()
	}

	getNode(nodeId: number): Partial<IDatabaseNodeStorage> {
		return this.storage.nodes?.get(nodeId) ?? {}
	}

	scheduleSave() {
		if (this.saveTimeout) {
			return
		}

		this.saveTimeout = setTimeout(this.save.bind(this), 100)
	}

	private async save() {
		if (this.saveTimeout) {
			clearTimeout(this.saveTimeout)
			this.saveTimeout = undefined
		}

		try {
			await writeFileAsync(this.databasePath, JsonMap.stringify(this.storage))
		} catch (error) {
			if (error.code !== 'ENOENT') {
				return
			}

			this.log.error('Failed to save database', error)
		}
	}
}
