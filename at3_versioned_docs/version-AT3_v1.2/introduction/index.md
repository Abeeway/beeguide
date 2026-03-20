---
keywords: [ AT3, AT3_v1.2 ]
sidebar_position: 1
---

# Abeeway trackers reference guide overview

This document describes in detail the usage of the **Asset Tracker 3 (AT3) application firmware v1.2.**.

It covers all the technical design aspects to the firmware. It particularly addresses:

-   The design of the application

-   The dynamic behavior of the tracker

-   The configuration and the user interface

-   The applicative payloads.

## Applicable Products

The AT3 firmware is applicable only to AT3 compliant tracker models

## Definitions, Acronyms and Abbreviations

The terms *Software* and *Firmware* are used interchangeably in this
document.

| Acronym           | Description                                      |
|-------------------|----------------------------------------------------|
| AOS-SDK           | Abeeway Operating system, Software Development Kit |
| AT3               | Assert-tracker 3, the application layer of Abeeway trackers |
| BLE               | Bluetooth Low Energy                              |
| CLI               | Command Line Interface                            |
| FID               | 32-bit parameter Full Identifier                   |
| FQDN              | Fully Qualified Domain Name                        |
| LID               | 16-bit parameter Local Identifier                  |
| LoRa / LoRaWAN    | Long Range Radio, as specific by the [LoRa Alliance](https://lora-alliance.org/) |
| RFU               | Reserved for Future Use                            |

## Content
Here is the outline of the remaining parts of the document.

- [Release notes](../release-notes.md) highlights the new features of each release and lists the known-issues.
- [Application design](../application-design.md) presents the high level design principles of the firmware.
- [Event manager](../event-manager.md) details the events handled by the firmware and their specific roles.
- [Functioning](../functioning.md) provides an overview of the firmware's core features.
- [Device and Power monitoring](../device-power-monitoring.md) describes the device temperature and power monitoring functionality.
- [User Interface](../user-interface.md) details the button and LED patterns.
- [Configuration](../configuration.md) is the reference for all configuration parameters.
- [Geolocation manager](../geoloc-manager.md) Explains the multi-technology geolocation engine and how it triggers location fixes.
- [GNSS manager](../gnss-manager.md) convers the GNSS subsystem along with almanac management.
- [BLE scan](../ble-scan.md) introduces the Bluetooth scanning functionality.
- [Networking](../networking.md) explains the management of LPWAN connectivity (LTE-M, NB-IoT and LoRaWAN).
- [Payload manager](../payload-manager.md) introduces the management of uplinks (segmentation, buffering).
- [Application uplink](../application-uplink.md) explains the structure and payload formats of uplink messages (uplink requests, unsollicited frames and responses to commands).
- [Application downlink](../application-uplink.md) explains the structure and payload formats of downlink messages (commands and responses to uplink requests)
- [System time update](../system-time.md) Discusses the approach to managing system time in the firmware.
