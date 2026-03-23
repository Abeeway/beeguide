---
keywords: [ AT3, AT3_v1.4 ]
sidebar_position: 1
---

# Reference guide overview

This document details the **Asset Tracker 3 (AT3) application firmware v1.4**, covering:

- Application design
- Tracker dynamic behavior
- Configuration and user interface
- Applicative payloads

## Applicable Products

The AT3 firmware is applicable only to AT3 compliant tracker models

## Definitions, Acronyms and Abbreviations

The terms *Software* and *Firmware* are used interchangeably in this
document.

| Acronym           | Description                                                             |
|-------------------|-------------------------------------------------------------------------|
| AOS-SDK           | Abeeway Operating system, Software Development Kit                      |
| AT3               | Assert-tracker 3, the application layer of Abeeway trackers             |
| BLE               | Bluetooth Low Energy                                                    |
| CLI               | Command Line Interface                                                  |
| FID               | 32-bit parameter Full Identifier                                        |
| FQDN              | Fully Qualified Domain Name                                             |
| LID               | 16-bit parameter Local Identifier                                       |
| LoRa              | The LoRa RF physical layer, a [Semtech](https://semtech.com) technology |
| LoRaWAN           | The protocol defined by the [LoRa Alliance](https://lora-alliance.org/) |
| RFU               | Reserved for Future Use                                                 |

## Content

Here is the outline of the remaining parts of the document.

- [Functioning](./02-functioning.md) provides an overview of the firmware's core features.
- [Release Notes](./03-release-notes.md) highlights the new features of each release and lists the known-issues.
- [Application Design](./04-application-design.md) presents the high level design principles of the firmware.
- [Event Manager](./05-event-manager.md) details the events handled by the firmware and their specific roles.
- [Geolocation Manager](./06-geoloc-manager.md) explains the multi-technology geolocation engine and how it triggers location fixes.
- [GNSS Manager](./07-gnss-manager.md) covers the GNSS subsystem along with almanac management.
- [Networking](./08-networking.md) explains the management of LPWAN connectivity (LTE-M, NB-IoT and LoRaWAN).
- [Payload Manager](./09-payload-manager.md) introduces the management of uplinks (segmentation, buffering).
- [Application Uplinks](./10-application-uplink.md) explains the structure and payload formats of uplink messages (uplink requests, unsollicited frames and responses to commands).
- [Uplink Data Buffering](./11-uplink-data-buffering.md) explains how to recover lost frames from the device uplink frame buffer.
- [Application Downlinks](./10-application-uplink.md) explains the structure and payload formats of downlink messages (commands and responses to uplink requests)
- [Device and Power Monitoring](./13-device-power-monitoring.md) describes the device temperature and power monitoring functionality.
- [User Interface](./14-user-interface.md) details the button and LED patterns.
- [Configuration](./16-configuration.md) is the reference for all configuration parameters.
- [BLE scan](./17-ble-scan.md) introduces the Bluetooth scanning functionality.
- [System Time Update](./18-system-time.md) discusses the approach to managing system time in the firmware.
- [Firmware Update](./15-firmware-update.md) introduces the firmware types and the various ways to upgrade them (USB, BLE, Over-the-air).
