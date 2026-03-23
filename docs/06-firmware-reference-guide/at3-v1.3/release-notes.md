---
keywords: [ AT3, AT3_v1.3 ]
sidebar_position: 20
---

# Release Notes

## New features
- **Uplink frame buffer** (only for devices equipped with the optional external flash)
Uplinks are buffered in flash memory. In case of packet loss, this lets the back-end request the missing frames through the new [`get buffered uplinks` command](./application-downlink.md#get-buffered-uplinks-command).

- **Reset by magnet action**.
A RESET command has been added to the actions that can be assigned to the button events in core_buttonX_map paramters in the system group.

- **DevNonce cycling**  
  As a protection against replay attacks, LoRaWAN requires each JOIN request to use a new `DevNonce`. For LoRaWAN-only devices, the maximum number of `DevNonce` values (65,535 in LoRaWAN 1.0.x) is usually sufficient for the lifetime of the device. By default, the LoRa Basics Modem stack stops at the maximum `DevNonce` value. 

  However, for dual-network devices such as the Combo tracker, more frequent rejoin attempts may be required. Starting with AT3 1.3, the device will cycle the `DevNonce` back to `0` instead of remaining stuck at `65,535`.  

  These frames are still blocked by the LoRaWAN Network Server (LNS) replay protection, but they can easily be unblocked through the LNS API. Since the application can detect in advance when a device is approaching `DevNonce` exhaustion, the authorization for cycling can be proactively provided to the LNS.

- **File authentication (signed firmware) for remote upgrades**  
  To comply with the new EU security standard **EN 18031**, which requires file authentication, all remote firmware upgrade methods now require signed firmware. Local firmware update via USB still supports unsigned images. 

  Signed firmware files are identified by the `.bin.sign` extension added to the firmware filename.

- **Firmware update over BLE**. In addition to the existing firmware update via USB, it is now possible to upgrade both the application and the BLE firmware through BLE. This is supported by the browser based tool Beehive. This will only work with signed firmware, check that you have the `.bin.sign` extension.

- **Firmware update via LTE**. (Experimental only). In this release only CLI trigerred updates are supported.

- **Network parameter differentiation according to motion status**. The parameters related to network probing (`net_reconnection_spacing`, `net_main_probe_timeout`, `lorawan_probe_max_attempts`, `lorawan_probe_period`, `cell_cnx_timeout`) are now separately tunable for static conditions (`_static` suffix) or while in motion (`_motion` suffix). When upgrading the existing parameters get mapped to the `_static` parameters.

  This improvement reduces network flapping when the device is static in areas without coverage (e.g., underground parking), while making the switch to a backup network more responsive when the device is in motion.

- **Parameter `lorawan_dl_trigger_period` renamed to `lorawan_heartbeat_period`**  
  The parameter ID remains unchanged. This renaming improves consistency with the notification flags of parameter `0x0102 core_notif_enable`, which includes a *heartbeat* flag to enable heartbeat messages. The periodicity of these messages is controlled by `lorawan_heartbeat_period`.

- **Shutdown uplink**. In case the device shuts down through user action or in a critical low battery condition, the [power manager](./device-power-monitoring.md#managing-low-power-shut-down-brownout) will keep the network up long enough to send a shutdown notification.

## Known issues 
### AT3 v1.3.0

- **Parameters could be reset when battery is critically low**. If the
battery level is critically low during a parameter upgrade, parameters
may be reset to their default values. This can be avoided by ensuring
that the battery remains above the critical threshold during parameter
updates.

- **Device reset when erasing params while BLE connected**. When the
device is connected over BLE with very fast connection parameters and
we execute the command `conf erase all` the device reset wothout
erasing configuration.

- **Rolling reset with a wrong config for heartbeat period**. If the
heartbeat period is configured to 0, and the heartbeat notification is
enabled, the device enter a rolling reset loop.

- **Config CRC error**. Under certain conditions, after a configuration
update, the device may report a wrong CRC.

- **BLE read/write empty string param fail**. When reading an empty
string parameter or writing a string parameter with empty string, the
BLE client gets an error.