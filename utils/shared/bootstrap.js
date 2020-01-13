require('@babel/register')({
	extensions: ['.ts'],
})

const path = require('path')

require('dotenv').config({
	path: path.join(__dirname, '../../.env'),
})

let device = process.env.DEVICE_PATH

if (typeof device !== 'string' || device.length === 0) {
	throw new Error('`DEVICE_PATH` env var must be set.')
}

process.env.DEVICE_PATH = path.join(__dirname, '../..', device)
