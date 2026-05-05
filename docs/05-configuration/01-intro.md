---
title: Introduction
sidebar_position: 1
---

# Introduction

The device configuration can be changed in several ways:

- sending LoRaWAN downlink messages to the device,
- sending Cellular downlink messages to the device,
- using the device's Command Line Interface over USB,
- using the device's Command Line Interface over Bluetooth.

If you want to learn more about these low-level configuration methods, see the links in the "Further Reading" section at the end of this page. For a first hands-on experience, we recommend starting with our configuration tools.

## Configuration tools

Configuring a device with downlink messages or Command Line Interface (CLI) commands can be verbose and is not always the most convenient option. To simplify this process, Abeeway provides web tools that help users prepare, edit, and transfer configuration files.

Instead of sending a separate command for every parameter change, users can work with configuration files and then import or export them through USB or Bluetooth.

The main tools for this are BeeHive and Beequeen:

- [BeeHive](https://abeeway.github.io/beehive) can be used to import and export configuration files and to connect to the device CLI over Bluetooth or USB.
- [BeeQueen](https://abeeway.github.io/beequeen) is a web-based configuration file editor.

Both applications are designed for Chrome. They rely on Chrome's Web Bluetooth and File System APIs, which are not yet available in all browsers.

## Further Reading

More details on how to set configuration parameters can be found under the following links:

- <a
    href="/docs/firmware-reference-guide/latest/configuration"
    target="_blank"
    rel="noopener noreferrer"
  >Configuration parameters</a>
- <a
    href="/docs/firmware-reference-guide/latest/application-downlink#parameter-class-configuration-set-request"
    target="_blank"
    rel="noopener noreferrer"
  >Message format for setting config parameters via downlink</a>

{/* - [Configuration parameters](/docs/firmware-reference-guide/latest/configuration) */}
{/* - [Message format for setting config parameters via downlink](/docs/firmware-reference-guide/latest/application-downlink#parameter-class-configuration-set-request) */}
