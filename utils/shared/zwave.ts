import Zwave from '../../src/Zwave/Zwave'
import { NodeInfo, Value } from 'openzwave-shared'
import chalk from 'chalk'
import path from 'path'

function debug(msg, ...args) {
	console.log((chalk as any).gray(msg), ...args)
}

export interface Node {
	info: NodeInfo
	values: Value[]
}

export default function zwave(): Promise<Map<number, Node>> {
	const device = process.env.DEVICE_PATH

	const zwave = new Zwave({
		ConsoleOutput: false,
		Logging: false,
		SaveConfiguration: false,
	})

	const nodes = new Map<number, Node>()

	zwave.nodeAdded.subscribe(({ nodeId }) => {
		process.stdout.write('.')

		nodes.set(nodeId, {
			info: null,
			values: [],
		})
	})

	zwave.nodeAvailable.subscribe(({ nodeId, nodeInfo }) => {
		process.stdout.write('.')
		const node = nodes.get(nodeId)

		if (!node) {
			return
		}

		node.info = nodeInfo
	})

	zwave.valueAdded.subscribe(({ nodeId, value }) => {
		process.stdout.write('.')
		nodes.get(nodeId)?.values.push(value)
	})

	return new Promise((resolve, reject) => {
		zwave.on('driver ready', () => {
			debug('Connected')
		})

		zwave.on('scan complete', () => {
			process.stdout.write('\n')
			debug('Scan Complete')
			setImmediate(() => zwave.disconnect(device))
			resolve(nodes)
		})

		zwave.on('driver failed', () => {
			process.stdout.write('\n')
			setImmediate(() => zwave.disconnect(device))
			reject(new Error('Unable to connect to device.'))
		})

		debug(`Connecting to ${path.relative(process.cwd(), device)}`)
		zwave.connect(device)
	})
}
