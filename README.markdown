# homebridge-openzwave

[![Latest Version](https://img.shields.io/npm/v/homebridge-openzwave.svg)](https://www.npmjs.com/package/homebridge-openzwave)
[![Total Downloads](https://img.shields.io/npm/dt/homebridge-openzwave.svg)](https://www.npmjs.com/package/homebridge-openzwave)
[![Build Status](https://cloud.drone.io/api/badges/shnhrrsn/homebridge-openzwave/status.svg)](https://cloud.drone.io/shnhrrsn/homebridge-openzwave)
[![License](https://img.shields.io/npm/l/homebridge-openzwave.svg)](https://www.npmjs.com/package/homebridge-openzwave)

OpenZWave platform for Homebridge. The main goal of this project is to map Z-Wave protocol command classes to HomeKit Accessories, Services, and Characteristics. Theoretically, it should make it support any Open Z-Wave device.

This project was initially forked from [velocityzen/homebridge-platform-zwave](https://github.com/velocityzen/homebridge-platform-zwave) and has been completely rewritten in TypeScript.

## Supported Z-Wave Command Classes

- SWITCH_BINARY (37)
- SWITCH_MULTILEVEL (38)
- BATTERY (128)

## Requirements

- Z-Wave Gateway
  - [Aeotec Z-Stick Gen5](https://aeotec.com/z-wave-usb-stick)
- [OpenZwave](https://github.com/OpenZWave/open-zwave)

## Installation

1. [Homebridge](https://github.com/nfarina/homebridge)
2. `npm i -g homebridge-openzwave`
3. Add platform to your config file

## Configuration

In order to use this plugin, you’ll need to add the following JSON object to your Homebridge config file:

```json
{
  "platform": "openzwave",
  "name": "OpenZWave",
  "zwave": {
    "devicePath": "/dev/ttyACM0"
  }
}
```

| Config Key         | Description                                                                                                                                             | Required |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `platform`         | Homebridge Platform name.<br>This value should always be openzwave.                                                                                     | Y        |
| `name`             | The name of this platform within Homebridge.<br>This is mainly used for logs and can be any value you want.                                             | N        |
| `zwave`            | This contains the settings that will be passed to OpenZWave.                                                                                            | Y        |
| `zwave.devicePath` | The device path to your gateway.<br>See [Finding Your Device](#finding-your-device) for more information.]                                              | Y        |
| `uuidPrefix`       | Override the default prefix used when generating UUIDs for each node.<br>_NOTE: Most setups will not need to change this value._                        | N        |
| `accessories`      | Customize how your Z-Wave accessories behave in HomeKit, or exclude them entirely.<br>See the [Accessories](#accessories) section for more information. | N        |

### Finding Your Device

To locate your Z-Wave controller, try running `ls /dev/tty.*` or `ls /dev/cu.*` in terminal. Depending on your OS, you may also be able to run `ls -lah /dev/serial/by-id` to find additional context for which device in your Z-Wave gateway.

If you’re unable to figure out the correct device, try unplugging it and running the commands above, after that, plug it back in and look for the additional device that wasn’t there before.

### Accessories

The accessories config object allows you to customize how your devices appear and behave within HomeKit.

```json
{
  "platform": "openzwave",
  "name": "Z-Wave Platform",
  "zwave": {
    "devicePath": "/dev/ttyACM0"
  },
  "accessories": {
    "3": {
      "name": "My Fan Control",
      "classes": {
        "ignored": [128],
        "rewrite": [{ "from": 38, "to": 999001, "indexes": { "5": 0 } }]
      },
      "hints": ["fan"]
    }
  }
}
```

| Config Key                   | Description                                                                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                       | The default name this accessory should have in HomeKit.                                                                               |
| `commands`                   |                                                                                                                                       |
| `commands.ignored`           | An array of [Z-Wave command classes](src/Zwave/CommandClass.ts) you’d prefer this plugin not represent in HomeKit.                    |
| `commands.rewrite`           | An array of commands to rewrite to change their intended effect                                                                       |
| `commands.rewrite[].from`    | The [Z-Wave command class](src/Zwave/CommandClass.ts) to replace                                                                      |
| `commands.rewrite[].to`      | The [Z-Wave command class](src/Zwave/CommandClass.ts) to change to                                                                    |
| `commands.rewrite[].indexes` | A key value list to map the index of the `from` command to the `to` command.                                                          |
| `hints`                      | An array of strings to better help the plugin understand what type of device this is.<br>Currently the only supported value is `fan`. |

#### Excluding Accessories from HomeKit

If you have Z-Wave nodes you’d wish to exclude from HomeKit, you can hide them by setting the accessory to false:

```json
{
  "platform": "openzwave",
  "name": "Z-Wave Platform",
  "zwave": {
    "devicePath": "/dev/ttyACM0"
  },
  "accessories": {
    "3": false
  }
}
```

## Device Handlers

`homebridge-openzwave` supports global/shared device handlers to override default Z-Wave behavior. This can be useful for devices that use generic commands for more specific purposes, such as a fan control that only implements SWITCH_MULTILEVEL.

For more information on device handlers, see the [README](src/Devices/README.markdown).

## Development

### Environment

All development tooling dynamically configures OpenZWave through a `DEVICE_PATH` environment var that should be set to the location of your Z-Wave Gateway.

A `.env` file is supported in the root of the project directory.

### Tools

`homebridge-openzwave` has some tooling to help making development easier:

- `yarn testharness` will launch Homebridge through Babel/TypeScript pointed towards `src`
- `yarn util ls` displays a list of devices currently in your Z-Wave network
- `yarn util inspect :nodeid` query a specific node to display debug information including node info and command classes

### Remote Development

If your Z-Wave Controller is plugged into a different machine, you can access it remotely via `socat`.

> NOTE: Be sure to shutdown Homebridge on the machine before you run `socat` as the gateway only supports a single connection to it.

To get started, run this on the machine that your Z-Wave Controller is plugged into:

```bash
docker run --rm -ti  --privileged -p 32375:32375 -v /dev:/host/dev \
alpine/socat -d -d tcp-l:32375,reuseaddr,fork file:/host/dev/ttyACM0,raw,nonblock,echo=0
```

> NOTE: Remember to update your `/dev` path to match the path from [Finding Your Device](#finding-your-device).

Next you’ll just need to configure your local machine to access it:

```bash
socat -d -d pty,link=./ttyVACM0,echo=0,raw,waitslave tcp:$IP_OF_REMOTE_MACHINE:32375
```

And you should be good to go, just setup your `.env` file to include `DEVICE_PATH=./ttyVACM0`.
