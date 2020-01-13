# Devices

A way to provide default accessory configs for a device.

Device files should have a default export that implements the [IAccessoryConfig](../IAccessoryConfig.d.ts) interface. The config options available in the device file are the same ones available in platform config.

Device files are stored as `{manufacturerid}/{productid}.ts`.
