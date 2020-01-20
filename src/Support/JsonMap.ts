export function stringify(object: any, space?: string | number): string {
	return JSON.stringify(object, jsonMapReplace, space)
}

export function parse(json: string): any {
	return reviveJsonMaps(JSON.parse(json))
}

function jsonMapReplace(key: string, value: any) {
	if (value instanceof Map) {
		return {
			'@kind': 'map',
			'@value': [...value.entries()],
		}
	}

	return value
}

function reviveJsonMaps(value: any): any {
	if (Array.isArray(value)) {
		return value.map(value => reviveJsonMaps(value))
	} else if (typeof value !== 'object' || value === null) {
		return value
	}

	for (const [key, value2] of Object.entries(value)) {
		value[key] = reviveJsonMaps(value2)
	}

	if (value['@kind'] !== 'map') {
		return value
	}

	return new Map(value['@value'])
}
