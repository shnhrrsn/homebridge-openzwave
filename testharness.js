require('@babel/register')({
	extensions: ['.ts'],
})

const path = require('path')
const fixtures = path.join(__dirname, 'fixtures')

process.argv = [
	'',
	'',
	'--user-storage-path',
	path.join(fixtures, 'config'),
	'--plugin-path',
	path.join(fixtures, 'plugins'),
	'--debug',
]
require('homebridge/lib/cli')()
