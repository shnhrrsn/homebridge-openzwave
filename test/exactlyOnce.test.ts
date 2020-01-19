import test from 'ava'
import exactlyOnce from '../src/Support/exactlyOnce'

test('sanity', t => {
	let count = 0
	const callback = () => {
		count++
	}

	callback()
	t.is(count, 1)

	callback()
	t.is(count, 2)
})

test('ensure callback is fired', t => {
	let count = 0
	const callback = () => {
		count++
	}

	exactlyOnce(callback)(undefined)
	t.is(count, 1)
})

test('exactly once', t => {
	let count = 0
	const callback = () => {
		count++
	}

	const wrappedCallback = exactlyOnce(callback)
	wrappedCallback(undefined)
	t.is(count, 1)

	wrappedCallback(undefined)
	t.is(count, 1)
})
