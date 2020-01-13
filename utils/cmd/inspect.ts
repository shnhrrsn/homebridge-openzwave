import zwave from '../shared/zwave'
import AsciiTable from 'ascii-table'
import { Value } from 'openzwave-shared'
import { CommandClass } from '../../src/Zwave/CommandClass'

export default async function inspect(id: any) {
	id = Number(id) || null

	if (id === null) {
		throw new Error('Node ID required')
	}

	const node = await (await zwave())?.get(id)

	if (!node) {
		throw new Error('Node not found')
	}

	if (node.info) {
		const table = new AsciiTable(`Node ${id}: Device Info`, {})
		table.addRow('Manufacturer', node.info.manufacturer, node.info.manufacturerid)
		table.addRow('Product', node.info.product, node.info.productid)
		table.addRow('Type', node.info.type, node.info.producttype)
		table.addRow('Other', node.info.name, node.info.loc)
		console.log(table.toString())
		console.log()
	}

	if (node.values.length > 0) {
		const commands = new Map<number, Value[]>()

		for (const value of node.values) {
			if (!commands.has(value.class_id)) {
				commands.set(value.class_id, [])
			}

			commands.get(value.class_id).push(value)
		}

		// CommandClass
		for (const [commandClass, values] of commands.entries()) {
			const table = new AsciiTable(
				`Command Class: ${CommandClass[commandClass] ?? CommandClass}`,
				{},
			)
			table.setHeading('Instance', 'Index', 'Min', 'Max', 'Value', 'Mode', 'Label')
			for (const value of values) {
				table.addRow(
					value.instance,
					value.index,
					value.min,
					value.max,
					value.value,
					value.read_only ? 'RO' : value.write_only ? 'WO' : 'RW',
					value.label,
				)
			}
			console.log(table.toString())
			console.log()
		}
	}
}
