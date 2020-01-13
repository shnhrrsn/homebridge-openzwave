import zwave from '../shared/zwave'

export default async function ls() {
	for (const [nodeId, node] of await zwave()) {
		console.log(nodeId, node.info)
	}
}
