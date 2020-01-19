import { Value, ValueType as OzwValueType, ValueGenre } from 'openzwave-shared'
import { CommandClass } from '../src/Zwave/CommandClass'
import { ValueType } from '../src/Values/ValueType'

export default class MockValue implements Value {
	value_id: string = 'hmm'
	node_id = 2
	class_id = CommandClass.SWITCH_MULTILEVEL_V2
	type: OzwValueType = 'int'
	genre: ValueGenre = 'basic'
	instance = 0
	index = 0
	label = 'mock'
	units = 'mock'
	help = 'mock'
	read_only = false
	write_only = false
	min = 0
	max = 255
	is_polled = false
	value: ValueType

	constructor(value?: ValueType) {
		this.value = value ?? 10
	}
}
