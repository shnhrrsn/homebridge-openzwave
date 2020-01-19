import { ValueId } from 'openzwave-shared'

export default function stringifyValueId(valueId: ValueId): string {
	return `${valueId.node_id}-${valueId.class_id}-${valueId.instance}-${valueId.index}`
}
