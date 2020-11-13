# homebridge-openzwave

[![Latest Version](https://img.shields.io/npm/v/homebridge-openzwave.svg)](https://www.npmjs.com/package/homebridge-openzwave)
[![Total Downloads](https://img.shields.io/npm/dt/homebridge-openzwave.svg)](https://www.npmjs.com/package/homebridge-openzwave)
[![Build Status](https://cloud.drone.io/api/badges/shnhrrsn/homebridge-openzwave/status.svg)](https://cloud.drone.io/shnhrrsn/homebridge-openzwave)
[![License](https://img.shields.io/npm/l/homebridge-openzwave.svg)](https://www.npmjs.com/package/homebridge-openzwave)

OpenZWave platform for Homebridge. The main goal of this project is to map Z-Wave protocol command classes to HomeKit Accessories, Services, and Characteristics. Theoretically, it should make it support any Open Z-Wave device.

This project was initially forked from [velocityzen/homebridge-platform-zwave](https://github.com/velocityzen/homebridge-platform-zwave) and has been completely rewritten in TypeScript.

## Supported Z-Wave Command Classes

- [SWITCH_BINARY](src/Accessories/Drivers/SwitchBinaryDriver.ts) (37)
- [SWITCH_MULTILEVEL](src/Accessories/Drivers/SwitchMultiLevelDriver.ts) (38)
- [SENSOR_BINARY](src/Accessories/Drivers/SensorBinaryDriver.ts) (48)
- [SENSOR_MULTILEVEL](src/Accessories/Drivers/SensorMultiLevelDriver.ts) (49)
- [BATTERY](src/Accessories/Drivers/BatteryDriver.ts) (128)

## Requirements

- Z-Wave Controller
- OpenZWave
- [Homebridge](https://github.com/nfarina/homebridge)

### Z-Wave Controller

A Z-Wave Controller is any device that acts as a gateway hub for your Z-Wave network and manages your Z-Wave nodes (lights, sensors, locks, etc.). This device can be a USB device or a board <abbr title="Hardware Attached on Top">HAT</abbr>.

The following controllers are known to work:
  - [Aeotec Z-Stick Gen5](https://aeotec.com/z-wave-usb-stick)
  - [HomeSeer SmartStick+ G2 USB Z-Wave Stick](https://shop.homeseer.com/collections/z-wave-usb-sticks-network-controllers/products/z-wave-usb-stick)

But others should work too.

### OpenZWave

[OpenZWave](https://github.com/OpenZWave/open-zwave) is a library for applications to control Z-Wave networks via the z-wave controller. This plugin uses OpenZWave to interact with many types of devices.

#### Installation

<details><summary>Package manager</summary>
<p>
For Ubuntu/Debian:

```bash
sudo apt install libopenzwave1.5
sudo apt install libopenzwave1.5-dev
```

For Alpine:

```bash
sudo apk --no-cache add openzwave
sudo apk --no-cache add openzwave-dev
```
  
</p>
</details>

<details><summary>From source</summary>
<p>  
Note: on Raspberry Pi, replace `lib64` with `lib`

```bash
git clone https://github.com/OpenZWave/open-zwave.git
cd openzwave
make && sudo make install
export LD_LIBRARY_PATH=/usr/local/lib64
sudo sed -i '$a LD_LIBRARY_PATH=/usr/local/lib64' /etc/environment
sudo ldconfig
```
</p>
</details>


## Installation

### Add plugin

#### [homebridge-config-ui-x](https://github.com/oznu/homebridge-config-ui-x)

Search for `homebridge-openzwave` and install

#### Manual

`npm i -g homebridge-openzwave`

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
| `zwave.devicePath` | The device path to your controller.<br>See [Finding Your Device](#finding-your-device) for more information.                                             | Y        |
| `uuidPrefix`       | Override the default prefix used when generating UUIDs for each node.<br>_NOTE: Most setups will not need to change this value._                        | N        |
| `accessories`      | Customize how your Z-Wave accessories behave in HomeKit, or exclude them entirely.<br>See the [Accessories](#accessories) section for more information. | N        |

### Finding Your Controller

To locate your Z-Wave controller, try running `ls /dev/tty.*` or `ls /dev/cu.*` in terminal. Depending on your OS, you may also be able to run `ls -lah /dev/serial/by-id` to find additional context for which device path is your Z-Wave controller.

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
      "commands": {
        "ignored": [128],
        "rewrite": [
          {
            "from": 38,
            "to": 999001,
            "indexes": {
              "5": 0
            }
          }
        ]
      },
      "hints": ["fan"]
    }
  }
}
```

| Config Key                   | Description                                                                                                                                    |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                       | The default name this accessory should have in HomeKit.                                                                                        |
| `commands`                   |                                                                                                                                                |
| `commands.ignored`           | An array of [Z-Wave command classes](src/Zwave/CommandClass.ts) you’d prefer this plugin not represent in HomeKit.                             |
| `commands.rewrite`           | An array of commands to rewrite to change their intended effect                                                                                |
| `commands.rewrite[].from`    | The [Z-Wave command class](src/Zwave/CommandClass.ts) to replace                                                                               |
| `commands.rewrite[].to`      | The [Z-Wave command class](src/Zwave/CommandClass.ts) to change to                                                                             |
| `commands.rewrite[].indexes` | A key value list to map the index of the `from` command to the `to` command.                                                                   |
| `hints`                      | An array of strings to better help the plugin understand what type of device this is.<br>Currently supported values are: `fan` and `presence`. |

#### Excluding Accessories from HomeKit

If you have Z-Wave nodes you’d wish to exclude from HomeKit, you can hide them by setting the accessory to `false`:

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

## Adding Devices

Installing this plugin automatically adds a set of switches to HomeKit that allows you to add and remove Z-Wave nodes/devices. This allows you to include new Z-Wave devices to your Z-Wave network.

To add a device:
- Turn the 'Add Node' switch to on
- Place your Z-Wave device into inclusion mode. Note: This step varies per device.
- If the device paired successfully, you should see the 'Add Node' switch reset to off
- Wait a few seconds to a few minutes for the Z-Wave device to configure and appear within HomeKit.
- If needed, customize the device under the `accessories` key in the plugin config

Note: one of the switches, 'Add Secure Node' allows you to add a device with additional security features. Due to current limitations in OpenZWave, this impacts device responsivenes as there are additional communication steps involved. This may be resolved in future OpenZWave releases. Most devices do not need to be added as secure nodes.

## Device Handlers

`homebridge-openzwave` supports global/shared device handlers to override default Z-Wave behavior. This can be useful for devices that use generic commands for more specific purposes, such as a fan control that only implements `SWITCH_MULTILEVEL`.

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

### Emulated Development

You can run the testharness with a docker flag to launch an Z-Wave emulator with test devices.

```bash
yarn testharness --docker
```

### Remote Development

If your Z-Wave Controller is plugged into a different machine, you can access it remotely via `socat`.

> NOTE: Be sure to shutdown Homebridge on the machine before you run `socat` as the gateway only supports a single connection to it.

To get started, run this on the machine that your Z-Wave Controller is plugged into:

```bash
docker run --rm -ti  --privileged -p 32375:32375 -v /dev:/host/dev \
alpine/socat -d -d tcp-l:32375,reuseaddr,fork file:/host/dev/ttyACM0,raw,nonblock,echo=0
```

> NOTE: Remember to update your `/dev` path to match the path from [Finding Your Device](#finding-your-device).

Next, when launching the testharness on your local machine, pass through a `remote` flag:

```bash
yarn testharness --remote=$IP_OF_REMOTE_MACHINE:32375
```

The testharness will handle launching socat on your local machine and configuring `DEVICE_PATH` for you.
