import test from 'ava'
import MockValue from '../mocks/MockValue'
import ValueSetter from '../src/Values/ValueSetter'
import makeZwaveSet from './helpers/makeZwaveSet'
import MockNoopLogger from '../mocks/MockNoopLogger'

test('single set', async t => {
	const zwave = makeZwaveSet(10)
	const valueSetter = new ValueSetter(new MockNoopLogger(), new MockValue(63), zwave)
	t.is(87, await valueSetter.set(87))
})

test('double set', async t => {
	const zwave = makeZwaveSet(10)
	const valueSetter = new ValueSetter(new MockNoopLogger(), new MockValue(63), zwave)
	t.is(87, await valueSetter.set(87))
	t.is(63, await valueSetter.set(63))
})

test('multi set', async t => {
	const zwave = makeZwaveSet(50)
	const valueSetter = new ValueSetter(new MockNoopLogger(), new MockValue(63), zwave)

	// This will trigger immediately
	const set87 = valueSetter.set(87)

	// The next 3 sets should be queued
	// and the return value for all of them
	// should match the last one
	const set63 = valueSetter.set(63)
	const set6 = valueSetter.set(6)
	const set3 = valueSetter.set(3)

	// Verify results of prior sets
	t.is(87, await set87)
	t.is(3, await set63)
	t.is(3, await set6)
	t.is(3, await set3)

	// Just a simple test to make sure there’s no issues
	// after the queue has been cleared
	t.is(87, await valueSetter.set(87))
})
