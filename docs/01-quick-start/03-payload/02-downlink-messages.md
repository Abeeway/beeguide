---
title: Downlink Messages
sidebar_position: 2
---

# Downlink Messages

An application server can send downlink messages to the device to trigger actions, request information, or change its behaviour.

The list below gives a quick overview of the main message types. The examples are only there to illustrate each type and are not exhaustive.

## Downlink Message Types

Downlink message types have two categories: *Command messages* and *Request messages*.

### Command Messages

Command messages are sent to trigger actions on the device. Examples of request messages are

- Reset the tracker
- Start or stop SOS
- Request a position on demand
- Set the GPS/BeiDou almanac
- Start or stop BLE connectivity
- Get buffered uplinks
- etc.

### Request Messages

Request messages are sent to read information from the device or to update its configuration.

- Configuration get/set requests
- BLE connectivity status request
- CRC configuration request
- Sensor value requests
- Debug information requests
- FUOTA (Firmware Update Over The Air) requests

## Further Reading

<!-- - [Downlink payload format description](/docs/firmware-reference-guide/latest/application-downlink) -->
- <a
    href="/docs/firmware-reference-guide/latest/application-downlink"
    target="_blank"
    rel="noopener noreferrer"
  >Downlink payload format description</a>
- [Payload examples](https://github.com/Abeeway/abeeway-codec/blob/main/AT3/examples.json)
- [JavaScript encoder/decoder - GitHub](https://github.com/Abeeway/abeeway-codec)
- [JavaScript encoder/decoder - NPM](https://www.npmjs.com/package/abeeway-asset-tracker-driver-v3)
