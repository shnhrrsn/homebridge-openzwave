import MockValue from '../../mocks/MockValue'
import MockZwave from '../../mocks/MockZwave'
import { IZwave } from '../../src/Zwave/IZwave'
import { ValueType } from '../../src/Values/ValueType'

export default function makeZwaveRefresh(
	refreshValue: ValueType,
	setTimeoutInterval?: number,
): IZwave {
	const zwave = new MockZwave({
		handleSetValue() {},
		handleRefreshValue(valueId) {
			const set = () => {
				zwave.valueChanged.next({
					nodeId: valueId.node_id,
					comClass: valueId.class_id,
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
