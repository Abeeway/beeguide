---
sidebar_position: 20
---

# Release Notes

## New features
- **Improved FUOTA network interactions**. Network management has been
enhanced to support cellular FUOTA in different network configurations.
Please refer to the
[Binary file download section](./firmware-update#binary-file-download).

- **Remote command for triggering FUOTA**. A new downlink command
[`FUOTA request`](./application-downlink.md#fuota-request) has been
added to remotely trigger a FUOTA and corresponding responses
[`FUOTA response`](./application-downlink.md#fuota-response), and
notifications have been added.

- **Battery management**. Power management has been enhanced to handle
battery charging and replacement more efficiently:
[Power management](./device-power-monitoring#power-manager).

## Known issues 
### AT3 v1.4.0

- **Cellular stop working**. When attempting to put the modem in
airplane mode to release the antenna to probe the LoRaWAN network, if
the modem does not confirm the airplane mode as expected, the cellular
connectivity may remain stuck.

- **Network stuck in backup connecting state**. The
net_reconnection_spacing_xx does not seem to recover from this state.

- **BLE access race condition**. When using short duration for BLE scan
parameters and writing config in the flash the device stucks and the
watchdog resets it.