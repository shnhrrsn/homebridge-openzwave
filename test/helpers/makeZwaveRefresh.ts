import MockValue from '../../mocks/MockValue'
import MockZwave from '../../mocks/MockZwave'
import { IZwave } from '../../src/Zwave/IZwave'
import { ValueType } from '../../src/Values/ValueType'

export default function makeZwaveRefresh(
	refreshValue: ValueType,
	setTimeoutInterval?: number,
	callback?: () => void,
): IZwave {
	const zwave = new MockZwave({
		handleSetValue() {},
		handleRefreshValue(valueId) {
			const set = () => {
				if (callback) {
					callback()
				}

				zwave.valueRefreshed.next({
					nodeId: valueId.node_id,
					classId: valueId.class_id,
					value: new MockValue(refreshValue),
				})
			}

			if (setTimeoutInterval) {
				setTimeout(set, setTimeoutInterval)
			} else {
				set()
			}
		},
	})

	return zwave
}
