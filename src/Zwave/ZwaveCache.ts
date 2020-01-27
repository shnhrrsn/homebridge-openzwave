import { NodeInfo, Value } from 'openzwave-shared'
import { parse as parseXml } from 'fast-xml-parser'
import { readFileSync } from 'fs'

export default class ZwaveCache {
	private nodeInfos = new Map<number, NodeInfo>()
	private nodeValues = new Map<number, Value[]>()

	load(homeId: number) {
		let databasePath: string

		try {
			databasePath = require.resolve(`openzwave-shared/ozwcache_0x${homeId.toString(16)}.xml`)
		} catch (err) {
			return
		}

		const rawXml = readFileSync(databasePath).toString()
		const nodes = parseXml(rawXml, {
			ignoreAttributes: false,
			parseAttributeValue: true,
			attrNodeName: '$',
			attributeNamePrefix: '',
		}).Driver.Node

		for (const node of nodes) {
			const nodeId = Number(node.$.id)

			this.nodeInfos.set(nodeId, {
				manufacturer: node.Manufacturer.$.name,
				manufacturerid: hexify(node.Manufacturer.$.id),
				product: node.Manufacturer.Product.$.name,
				producttype: node.Manufacturer.Product.$.type,
				productid: hexify(node.Manufacturer.Product.$.id),
				type: node.$.type,
				name: node.Manufacturer.Product.$.name,
				loc: node.$.location,
			})

			if (!Array.isArray(node.CommandClasses.CommandClass)) {
				this.nodeValues.set(nodeId, [])
				continue
			}

			this.nodeValues.set(
				nodeId,
				[].concat(
					...(<any[]>node.CommandClasses.CommandClass)
						.map(({ Value: value }): any => {
							if (!value) {
								return undefined
							}

							return Array.isArray(value) ? value : [value]
						})
						.filter(value => value !== undefined),
				),
			)
		}
	}

	getNodeInfo(nodeId: number): NodeInfo | undefined {
		return this.nodeInfos.get(nodeId)
	}

	getNodeValues(nodeId: number): Value[] | undefined {
		return this.nodeValues.get(nodeId)
	}
}

function hexify(numeric: number | string) {
	return `0x${numeric.toString().padStart(4, '0')}`
}
