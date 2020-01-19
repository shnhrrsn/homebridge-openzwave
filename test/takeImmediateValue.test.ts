import test from 'ava'
import takeImmediateValue from '../src/Support/takeImmediateValue'
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs'

test('behavior subject', t => {
	const behaviorSubject = new BehaviorSubject('homebridge')
	t.is('homebridge', takeImmediateValue(behaviorSubject))
})

test('replay subject', t => {
	const replaySubject = new ReplaySubject()
	t.is(undefined, takeImmediateValue(replaySubject))
	replaySubject.next('homebridge')
	t.is('homebridge', takeImmediateValue(replaySubject))
})

test('subject', t => {
	t.is(undefined, takeImmediateValue(new Subject()))
})
