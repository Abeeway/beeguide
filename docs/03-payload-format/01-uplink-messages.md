---
title: Uplink Messages
sidebar_position: 1
---

# Uplink Messages

Abeeway devices can send different types of uplink messages depending on what they need to report. The list below provides a quick overview of the main message types. The examples are illustrative only and are not exhaustive.

## Uplink Message Types

Uplink messages fall into four categories: *Notification messages*, *Position messages*, *Query messages*, and *Response messages*.

### Notification Messages

Notification messages are sent when the device detects an event or a change in state.

- System notifications such as low battery or tamper detection
- SOS notifications
- Temperature alerts
- Motion-related notifications
- Network status notifications
- Geozoning notifications

### Position Messages

Position messages report location data collected by the device.

- GNSS location data
- Wi-Fi scan reports
- BLE scan reports

### Query Messages

Query messages are sent when the device needs additional information to operate more efficiently.

- Echo requests for cellular connectivity checks
- GPS/BeiDou almanac update requests for assisted GNSS

### Response Messages

Response messages are sent by the device in reply to certain downlink commands.

- Configuration set responses
- Configuration get responses
- BLE connectivity status responses

## Decoding Uplink Messages

You can manually decode uplink messages from Abeeway devices with the following simple app:
[DecoderApp](https://abeeway.github.io/abeeway-codec/examples/codec-as-browser-module.html)

For decoding uplink messages in your app you can use our JavaScript driver, published on NPM as
[abeeway-asset-tracker-driver-v3](https://www.npmjs.com/package/abeeway-asset-tracker-driver-v3).

If you prefer to download the driver manually, you can find it in the following GitHub repository:
[abeeway-codec](https://github.com/Abeeway/abeeway-codec)

If you’d like to use our JavaScript driver in a Python environment, please refer to the following GitHub repository, which explains how to embed the driver within Python code:
[abeeway-driver-python](https://github.com/norbertherbert/abeeway-driver-python)

## Further Reading

- [Uplink payload format description](https://docs.thingpark.com/thingpark-location/firmware/application-uplink)
- [Payload examples](https://github.com/Abeeway/abeeway-codec/blob/main/AT3/examples.json)
- [JavaScript encoder/decoder - GitHub](https://github.com/Abeeway/abeeway-codec)
- [JavaScript encoder/decoder - NPM](https://www.npmjs.com/package/abeeway-asset-tracker-driver-v3)
