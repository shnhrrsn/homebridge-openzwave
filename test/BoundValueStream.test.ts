import test from 'ava'
import MockZwave from '../mocks/MockZwave'
import MockNoopLogger from '../mocks/MockNoopLogger'
import MockValue from '../mocks/MockValue'
import BoundValueStream from '../src/Streams/BoundValueStream'
import { ValueType } from '../src/Values/ValueType'
import takeImmediateValue from '../src/Support/takeImmediateValue'

test('initial value', t => {
	const zwave = new MockZwave({
		handleSetValue() {},
		handleRefreshValue() {},
	})
	const initialValue = new MockValue(63)
	const boundValueStream = new BoundValueStream(initialValue, zwave, new MockNoopLogger())
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))
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
	boundValueStream.refresh()
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
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
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	boundValueStream.set(87)
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})

test('slow set value', async t => {
	const initialValue = new MockValue(63)
	const zwave = new MockZwave({
		handleSetValue(valueId, value) {
			setTimeout(() => {
				zwave.valueChanged.next({
					nodeId: valueId.node_id,
					comClass: valueId.class_id,
					value: new MockValue(value),
				})
			}, 100)
		},
		handleRefreshValue() {},
	})

	const boundValueStream = new BoundValueStream(initialValue, zwave, new MockNoopLogger())
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	let promise = boundValueStream.set(87)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	await promise
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})

test('slow multi set value', async t => {
	const initialValue = new MockValue(63)
	const zwave = new MockZwave({
		handleSetValue(valueId, value) {
			setTimeout(() => {
				zwave.valueChanged.next({
					nodeId: valueId.node_id,
					comClass: valueId.class_id,
					value: new MockValue(value),
				})
			}, 100)
		},
		handleRefreshValue() {},
	})

	const boundValueStream = new BoundValueStream(initialValue, zwave, new MockNoopLogger())
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	boundValueStream.set(6)
	boundValueStream.set(3)
	let promise = boundValueStream.set(87)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	await promise
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})
