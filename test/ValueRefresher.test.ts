import test from 'ava'
import MockValue from '../mocks/MockValue'
import MockNoopLogger from '../mocks/MockNoopLogger'
import ValueRefresher from '../src/Values/ValueRefresher'
import MockZwave from '../mocks/MockZwave'
import wait from './helpers/wait'
import makeZwaveRefresh from './helpers/makeZwaveRefresh'

test('single refresh', async t => {
	let count = 0
	const valueRefresher = new ValueRefresher(
		new MockNoopLogger(),
		new MockValue(63),
		makeZwaveRefresh(87, undefined, () => count++),
	)
	valueRefresher.refresh()
	t.is(1, count)
})

test('double refresh', async t => {
	let count = 0
	const valueRefresher = new ValueRefresher(
		new MockNoopLogger(),
		new MockValue(63),
		makeZwaveRefresh(87, 10, () => count++),
	)
	valueRefresher.refresh()
	valueRefresher.refresh()

	await wait(50)
	t.is(1, count)
})

test('multi refresh', async t => {
	let count = 0
	const valueRefresher = new ValueRefresher(
		new MockNoopLogger(),
		new MockValue(63),
		makeZwaveRefresh(87, 10, () => count++),
	)
	valueRefresher.refresh()
	valueRefresher.refresh()

	await wait(50)
	t.is(1, count)

	valueRefresher.refresh()

	await wait(50)
	t.is(2, count)
})
