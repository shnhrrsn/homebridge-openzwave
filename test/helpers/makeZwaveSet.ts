import { IZwave } from '../../src/Zwave/IZwave'
import MockValue from '../../mocks/MockValue'
import MockZwave from '../../mocks/MockZwave'

export default function makeZwaveSet(setTimeoutInterval?: number): IZwave {
	const zwave = new MockZwave({
		handleSetValue(valueId, value) {
			const set = () => {
				zwave.valueChanged.next({
					nodeId: valueId.node_id,
					classId: valueId.class_id,
					value: new MockValue(value),
				})
			}

			if (setTimeoutInterval) {
				setTimeout(set, setTimeoutInterval)
			} else {
				set()
			}
		},
		handleRefreshValue() {},
	})

	return zwave
}
