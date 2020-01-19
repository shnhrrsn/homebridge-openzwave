import test from 'ava'
import MockZwave from '../mocks/MockZwave'
import MockNoopLogger from '../mocks/MockNoopLogger'
import MockValue from '../mocks/MockValue'
import BoundValueStream from '../src/Streams/BoundValueStream'
import { ValueType } from '../src/Values/ValueType'

test('initial value', t => {
	const zwave = new MockZwave({
		handleSetValue() {},
		handleRefreshValue() {},
	})
	const initialValue = new MockValue(63)
	const boundValueStream = new BoundValueStream(initialValue, zwave, new MockNoopLogger())
	let subscribedValue: ValueType | undefined = undefined
	boundValueStream.valueObservable
		.subscribe(value => {
			subscribedValue = value
		})
		.unsubscribe()
	t.is(63, subscribedValue)
})

test('refresh value', t => {
	const initialValue = new MockValue(63)
	const zwave = new MockZwave({
		handleSetValue() {},
		handleRefreshValue() {
			zwave.valueRefreshed.next({
				nodeId: initialValue.node_id,
				comClass: initialValue.class_id,
				value: new MockValue(87),
			})
		},
	})

	const boundValueStream = new BoundValueStream(initialValue, zwave, new MockNoopLogger())
	let subscribedValue: ValueType | undefined = undefined
	boundValueStream.refresh()
	boundValueStream.valueObservable
		.subscribe(value => {
			subscribedValue = value
		})
		.unsubscribe()
	t.is(87, subscribedValue)
})

test('set value', t => {
	const initialValue = new MockValue(63)
	const zwave = new MockZwave({
		handleSetValue(valueId, value) {
			zwave.valueChanged.next({
				nodeId: valueId.node_id,
				comClass: valueId.class_id,
				value: new MockValue(value),
			})
		},
		handleRefreshValue() {},
	})

	const boundValueStream = new BoundValueStream(initialValue, zwave, new MockNoopLogger())
	let subscribedValue: ValueType | undefined = undefined
	boundValueStream.set(87)
	boundValueStream.valueObservable
		.subscribe(value => {
			subscribedValue = value
		})
		.unsubscribe()
	t.is(87, subscribedValue)
})
