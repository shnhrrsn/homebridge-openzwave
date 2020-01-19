import test from 'ava'
import takeFreshValue from '../src/Support/takeFreshValue'
import { BehaviorSubject, ReplaySubject } from 'rxjs'

test('sanity', async t => {
	const behaviorSubject = new BehaviorSubject('homebridge')
	let value: string | undefined = undefined
	behaviorSubject
		.subscribe(nextValue => {
			value = nextValue
		})
		.unsubscribe()
	t.is('homebridge', value)
})

test('behavior subject', t => {
	const behaviorSubject = new BehaviorSubject('first')
	const promise = takeFreshValue(behaviorSubject).then(value => {
		t.is('second', value)
	})
	behaviorSubject.next('second')
	return promise
})

test('replay subject', t => {
	const replaySubject = new ReplaySubject()
	replaySubject.next('first')
	const promise = takeFreshValue(replaySubject).then(value => {
		t.is('second', value)
	})
	replaySubject.next('second')
	return promise
})

test('timeout', t => {
	const replaySubject = new ReplaySubject()
	const promise = takeFreshValue(replaySubject, 50)
		.then(() => {
			t.fail()
		})
		.catch(err => {
			t.is('Timeout', err.message)
		})
	return promise
})
