---
sidebar_position: 2
---

# Device Activation

Before an Abeeway tracker can start reporting positions and events, it must be prepared for the selected network technology and then taken out of Shipping Mode.

In practice, device activation usually consists of two stages:

1. Preparing the device for network connectivity by provisioning it on a LoRaWAN Network Server or by installing and configuring a SIM card for cellular communication.
2. Turning the device on so it can connect to the configured network and start operating normally.

The following sections provide a short overview of both stages.

## Preparing for network connectivity

### LoRaWAN Connectivity

To use LoRaWAN connectivity, the device must first be provisioned on your LoRaWAN Network Server (LNS). During this step, the device is registered in the network and associated with the credentials required for the join procedure.

The following parameters are required during provisioning: `DevEUI`, `JoinEUI`, `AppKey`.

Once provisioning is complete, make sure there is a LoRaWAN gateway connected to your LNS and providing coverage in the area where the device will be activated.

Without proper gateway coverage, the tracker will not be able to send join requests and therefore cannot attach to the LoRaWAN network during activation.

### Cellular network connectivity

To use cellular connectivity, you must insert a SIM card associated with an appropriate NB-IoT or LTE-M subscription.

Cellular connectivity parameters such as the Access Point Name (APN), destination IP address or URL, and destination port can be configured using [BeeHive](https://norbertherbert.github.io/beehive) and [BeeQueen](https://norbertherbert.github.io/beequeen), as described in the **Device Configuration** section.

## Turning the device on

Devices are shipped in Shipping Mode, a low-power state designed to preserve battery life. LPWAN connectivity is disabled while the device remains in this mode.

After activation, the tracker attempts to connect to the LPWAN network defined by its network configuration parameters.

The main steps of the startup and activation process are:

1. If the device is still in Shipping Mode, it remains in low-power state until it detects either a long button press or a magnet activation sequence.
2. After detecting the activation sequence, the tracker attempts to connect to the configured LPWAN network.
3. Once connected to a LoRaWAN or cellular network, the tracker starts reporting positions.

With the default configuration, the tracker enters Active State and performs geolocation fixes according to its geolocation settings.
