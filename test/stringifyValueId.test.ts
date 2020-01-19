import test from 'ava'
import stringifyValueId from '../src/Support/stringifyValueId'

test('equality', t => {
	t.is(
		'0-0-0-0',
		stringifyValueId({
			node_id: 0,
			class_id: 0,
			instance: 0,
			index: 0,
		}),
	)
	t.is(
		'1-2-3-4',
		stringifyValueId({
			node_id: 1,
			class_id: 2,
			instance: 3,
			index: 4,
		}),
	)
})
