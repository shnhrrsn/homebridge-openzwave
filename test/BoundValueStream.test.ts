import test from 'ava'
import MockZwave from '../mocks/MockZwave'
import MockNoopLogger from '../mocks/MockNoopLogger'
import MockValue from '../mocks/MockValue'
import BoundValueStream from '../src/Streams/BoundValueStream'
import takeImmediateValue from '../src/Support/takeImmediateValue'
import makeZwaveSet from './helpers/makeZwaveSet'
import makeZwaveRefresh from './helpers/makeZwaveRefresh'
import { MockValueObservables } from '../mocks/MockValueObservables'

test('initial value', t => {
	const zwave = new MockZwave({
		handleSetValue() {},
		handleRefreshValue() {},
	})
	const initialValue = new MockValue(63)
	const boundValueStream = new BoundValueStream(
		initialValue,
		new MockValueObservables(zwave),
		new MockNoopLogger(),
	)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))
})

test('refresh value', t => {
	const boundValueStream = new BoundValueStream(
		new MockValue(63),
		new MockValueObservables(makeZwaveRefresh(87)),
		new MockNoopLogger(),
	)
	boundValueStream.refresh()
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})

test('set value', t => {
	const boundValueStream = new BoundValueStream(
		new MockValue(63),
		new MockValueObservables(makeZwaveSet()),
		new MockNoopLogger(),
	)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	boundValueStream.set(87)
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})

test('slow set value', async t => {
	const boundValueStream = new BoundValueStream(
		new MockValue(63),
		new MockValueObservables(makeZwaveSet(100)),
		new MockNoopLogger(),
	)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	let promise = boundValueStream.set(87)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	await promise
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})

test('slow multi set value', async t => {
	const boundValueStream = new BoundValueStream(
		new MockValue(63),
		new MockValueObservables(makeZwaveSet(100)),
		new MockNoopLogger(),
	)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	boundValueStream.set(6)
	boundValueStream.set(3)
	let promise = boundValueStream.set(87)
	t.is(63, takeImmediateValue(boundValueStream.valueObservable))

	await promise
	t.is(87, takeImmediateValue(boundValueStream.valueObservable))
})
