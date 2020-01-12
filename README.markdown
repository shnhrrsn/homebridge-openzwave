# homebridge-openzwave

[![NPM Version](https://img.shields.io/npm/v/homebridge-openzwave.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-openzwave)
[![NPM Downloads](https://img.shields.io/npm/dt/homebridge-openzwave.svg?style=flat-square)](https://www.npmjs.com/package/homebridge-openzwave)

OpenZWave platform for Homebridge. The main goal of this project is to map Z-Wave protocol command classes to HomeKit Accessories, Services, and Characteristics. Theoretically, it should make it support any Open Z-Wave device.

This project was initially forked from [velocityzen/homebridge-platform-zwave](https://github.com/velocityzen/homebridge-platform-zwave) and has been completely rewritten in TypeScript.

## Supported Z-Wave Command Classes

**Work In Progress** (the list shows command classes for the devices I currently have)

- [x] SWITCH_BINARY (37)
- [x] SWITCH_MULTILEVEL (38)
- [ ] CENTRAL_SCENE (91)

## Prerequisites

1. Z-Wave gateway. For example [Aeotec Z-Stick Gen5](https://aeotec.com/z-wave-usb-stick)
2. Installed https://github.com/OpenZWave/open-zwave

## Installation

1. [Homebridge](https://github.com/nfarina/homebridge)
2. `npm i -g homebridge-openzwave`
3. Add platform to your config file

## Config

Add the minimal platform configuration. This plugin creates `Add Node`, `Add Secure Node`, and `Remove Node` buttons for your controller. All the supported command classes from all devices paired with your gateway appear in the Home app.

```json
{
  "platform": "zWavePlatform",
  "name": "Z-Wave Platform",
  "zwave": {
    "devicePath": "/dev/cu.usbmodem144101"
  }
}
```

- **zwave**
  - **devicePath** — path to the gateway. For the list use `ls /dev/cu.*` and/or `ls /dev/tty.*`

### Accessories

If you want to customize exposed accessories, add `accessories` to your config. Ex.:

```
{
  "platform": "zWavePlatform",
  "name": "Z-Wave Platform",
  "zwave": {
    "devicePath": "/dev/cu.usbmodem144101"
  },
  "accessories": {
    "3": {
      "name": "My Switch",
      "ignoreClasses": [ 38 ],
      "values": {
        "112-1-35": 37
      },
      "hints": [ "fan" ]
    }
  }
}
```

- **NodeId** – "3" in the example above. NodeId of the node (device) the config is applied to.
- name – string, name of the device in the Home app.
- ignoreClasses – the array of the command classes Ids to ignore.
- values – map of `valueId: value` to set the initial value.
- parameters – map of `parameterId: value` to set the initial value.
- valuesMaps – map of `valueId: valueMaps` to map a value from Z-Wave to HomeKit.
- hints – set of strings to help better understand the device. Currently only `fan` is supported.

You can also set the node config to `false` to ignore the node (device) entirely.

## Notes

All the devices and command classes will be tested and added to this plugin as soon as I can get the device in my hands or with your help. Donations and PRs are welcome!
