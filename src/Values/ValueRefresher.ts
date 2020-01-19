import { ValueId } from 'openzwave-shared'
import { IValueStreams } from '../Streams/IValueStreams'
import { Homebridge } from '../../types/homebridge'
import takeFreshValue from '../Support/takeFreshValue'

/**
 * Throttles refresh requests by ensuring only a single refresh
 * takes place at amy given time.
 */
export default class ValueRefresher {
	private isRefreshing = false
	readonly valueId: ValueId
	readonly valueStreams: IValueStreams
	readonly log: Homebridge.Logger

	constructor(log: Homebridge.Logger, valueId: ValueId, valueStreams: IValueStreams) {
		this.log = log
		this.valueId = valueId
		this.valueStreams = valueStreams
	}

	refresh() {
		if (this.isRefreshing) {
			this.log.debug('Already refreshing')
			return
		}

		this.valueStreams.zwave.refreshValue(this.valueId)
		this.isRefreshing = true
		this.log.debug('Refreshing')

		takeFreshValue(this.valueStreams.valueRefreshed, 10_000)
			.then(() => this.log.debug('Refreshed'))
			.catch(error => this.log.debug('Failed to refresh', error.message))
			.finally(() => {
				this.isRefreshing = false
			})
	}
}
