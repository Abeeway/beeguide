---
keywords: [ AT3, AT3_v1.4 ]
sidebar_position: 15
---

# Device Firmware Update (DFU)

## Firmware types and firmware update methods

### Applicative (MCU) firmware

This is the "Asset Tracker" code (e.g. AT3) defining the top level application behavior of the device. It runs on the main MCU.

The application firmware can always be updated via USB, except ATEx/IECEx zone 1 devices (the USB data tracks are disabled to prevent injection of high voltage) and specific versions requiring military grade security.

As of AT3 v1.4, the application firmware can also be updated:

- via BLE.
- via the cellular network (Combo cellular LPWAN CompactTracker only)

### BLE firmware

The BLE subsystem firmware can be upgraded via BLE or via the cellular network.

### GNSS firmware

Both the MT3333 GNSS and the LR1110 chip have upgradable firmware. These chipsets get flashed in factory and cannot be upgraded by users.

## Firmware update via USB

 For the badge trackers (except ATEX Zone1 models), the USB port is accessible through the magnetic connector. For the Compact and Combo cellular LPWAN compact, accessing the USB port requires opening the casing.

 :::warning
You should be aware that **Abeeway trackers DO NOT derive their power from the USB port when connected to a charger. All power is still provided by the battery.**

- Opening the casing causes the tamper switch to close, trigering the tamper alarm but also causing a permanent current to flow through this circuit and the MCU to go always-on mode, impacting the battery lifetime.
- Connecting the USB port causes the MCU to enter always-on mode to process the serial communication.

**Check your charge level before attempting an upgrade**
**Disconnect the USB cable and close the casing and as soon as you are done with the FW update!** 
 :::

### Entering Bootloader mode

Connect using a USB cable, select the appropriate USB port from your terminal and open the connection (If you use Tera Term, this is File --> New connection).

:::tip
You must type your user password (by default '123') to get a `User>` prompt and type further commands.
You can change the user password via parameter `0x010e core_cli_password`. Do not use value 0 as it will disable user access. If this happens you will need a superuser password, contact Abeeway support.
:::

If you see the `User>` prompt, you are in interactive mode and can type further commands.
 Before upgrading, you probably want to backup your current configuration:

- Disable logs to prevent parasitic output. Type `sys log off`.
- Type `conf show all` to display all configuration parameters and their current value, and copy the configuration.
You can also use the browser based 'Beehive' tool to save the configuration.

Check that your battery level is above 20%:

```console
user> power info
power info
Information
 Battery type: primary
 Battery capacity: 8000 mAh
 Battery voltage: 3556 mV
 Consumption: 12.080 mAh
 Remaining charge: 100 %
OK
```

You are ready to enter bootloader mode. From the USB command line interface, type:

```console
User> system boot
```

:::tip
The command can be abbreviated to e.g. `sys bo` as AT3 supports autocompletion. This causes the device to restart in bootloader mode. The USB port disconnects and reconnects.
:::

The CLI prompt changes to `?` in bootloader mode.

### Bootloader commands and XMODEM firmware upload

Check that you are in bootloader mode, the prompt should be `?`.

- Type `ABWe`to erase all parameters in flash (a good practice unless you are certain that the parameter set is compatible with the new firmware).
- Type `ABWu`to enter XMODEM upload mode. The device enters upload mode for a limited time and just outputs a periodic `*` hertbeat to signal that it is alive and waiting for the new firmware binary file.

From your terminal (e.g. Tera Term), select the new AT3 firmware and send over USB using XMODEM (For Tera Term: File--> Transfer --> XMODEM --> Send). You should see a progress bar and the update will take about 30 seconds.

:::tip
USB firmware update is unsigned: select the `.bin` extension for the binary file, not the `.bin.sign` extension which is used for firmware update over the air (FUOTA).
:::

If the firmware upload is successful, the bootloader CLI prompt will return. Type `r` to reset. After boot, you are back to the AT3 command line interface. Enter the user password again, then at the `User>` prompt, type `sys info` to check that you are running the new firmware.

If the update fails or if the bootloader times out, the device will self reset to the previous firmware.

The new firmware will start from the defaut parameter configuration. You can use commands `conf set <parameter_ID> <parameter value>` to restore your saved parameters. Note that the Abeeway firmware file format supports concatenated parameters. For mass upgrading, Abeeway support can provide pre-configured firmware as well as mass-provisioning tools which allow multiple parallel upgrades over a USB hub.

:::tip
You can also use the browser-based 'Beehive' tool to restore a previously saved configuration. If some parameters are no longer compatible with the new firmware, they could get rejected: watch the log and inspect rejected parameters.
:::

## Firmware update via BLE

You must use the 'Beehive' tool available at the [BeeGuide](https://abeeway.github.io/beeguide/) documentation page.

Beehive is optimized for the Chrome browser as it requires BLE connectivity support from the browser.

:::tip
You must pair the device with your computer before using Beehive. Under Windows, go to "Bluetooth and other device settings", then 'add device' and chose the Bluetooth device category. The computer searches for nearby advertising devices, you may need to click "Show all devices" to see your device.
Select the device and click "connect".

If you don't see your device, you may need to activate BLE advertising. On the Compact tracker, this requires a magnet (use a strong magnet), and an activation sequence, by default 3 seconds near the hall sensor (small arrow on the casing), then 3 seconds away form sensor, then 3 seconds close to the sensor again. You can count as follows:

- Bring the magnet close to arrow at "zero"
- Say "... and one and two and three"
- Remove magnet at "three"
- Say "... and one and two and three"
- Bring the magnet close to arrow at "three"
- Say "... and one and two and three"
- Remove magnet.

It is surprisingly difficult to execute this sequence correctly! Common mistakes include starting the count at "one", or restarting from "zero" after "three", so familiarize yourself with the sequence :)
:::

Select 'Connect a BLE device' button in the Beehive tool and select the target device.

After connecting, you will see several options:

- "Export config" to back-up your parameter set to a file.
- "Import config" to restore theparamteter set from a backup file.
- "Firmware update" to initiate an applicative firmware update or a BLE subsystem firmware update.

The firmware updates take about 30s to complete.

## Firmware update via the cellular network (Cellular FUOTA)

:::warning
This is a preview feature in AT3 v1.4 and is available only for Combo
Tracker devices.
:::

### Overview of cellular FUOTA

The cellular FUOTA process consists of two phases:

- **Phase 1. Binary file download**: The firmware binary is downloaded
over the cellular network and stored in the flash memory.
- **Phase 2. Code transfer**: The downloaded binary is copied from flash
into the main MCU flash memory and the device reboots into the new firmware.

#### Binary file download  

The firmware binary is downloaded over the cellular network using
**HTTPS** (TLS 1.2 with Basic Authentication), ensuring encrypted and
authenticated communication.  

The device stores the firmware segments to external flash memory. The
download is **resilient to temporary disconnections** and will resume
from the last completed offset.  

Once the download is complete:

- AT3 verifies that the binary type matches the platform type (e.g.,
Compact Tracker, Combo Cellular Compact Tracker, Abeeway 1WL EVK).  
- If this check passes, the firmware signature is verified.

> During Phase 1, the download code runs from internal flash, so the tracker AT3 firmware continues to operate normally in parallel.

:::note

- The binary download process may require multiple retries. Each retry has a timeout of **300 s (5 min)**.  
- In a successful scenario, the typical download time for a release file is ~**2 min 30 s**.  
- In high-latency or weak-signal networks, throughput may drop to ~**5 kbps**. Even under such conditions, the file can usually be downloaded within **4 retries** (given the 300 s retry timeout), which is the maximum number of retries.  
- The download will be aborted if any **unrecoverable condition** occurs:
  - File not found on the remote server  
  - Network unavailable and the modem is powered off  
  - Download administratively aborted by the FUOTA Manager

:::

Please note that dependng on the network manager's configuration, the
device may behaves differently during the download:

- If the network manager is configured to **LTE only configuration**:
  the FUOTA start request can be received over the cellular network, and
  the binary download will begin immediately. The download will be aborted
  if the operation times out (e.g., maximum retries are reached) or if the
  cellular network becomes unavailable.

- If the network manager is configured to **LTE as main network**:
  In this configuration, the FUOTA request can be received over either the
  cellular or LoRa network, depending on which interface is active.
  Two cases are possible:

  - When the cellular network is active, the binary file download will
    start immediately and will be aborted if the network becomes unavailable
    or the operation times out.

  - When the LoRa network is active (configured as a backup), the FUOTA
    process will be postponed until the cellular network (configured as the
    primary) is reconnected, after the probing period has expired. This
    strategy assumes that if LoRa is currently connected, it indicates a
    loss of the cellular network, so there is no need to initiate the main
    probing earlier.

- If the network manager is configured to **LTE as backup network**:
  In this configuration, the FUOTA request can be received over either the
  cellular or LoRa network, depending on which interface is active. Two
  cases are possible:

  - When the LoRa network (configured as the main network) is active,
    the FUOTA process will be postponed. The LoRa network will be suspended
    by triggering a switch to the cellular network (configured as the
    backup). Based on the behavior of the cellular network several scenarios
    are possible:

  - If the cellular network is connected, the probing mechanism will
    be disabled to prevent switching back to LoRa during the binary
    download, and the file download will start immediately.
  - If the cellular network is not available, the FUOTA process will
    be dropped and the associated notification will be queued. The LoRa
    network will be resumed immediately.
  - Once the download is complete, whether it succeeds or fails, The
    LoRa network will be resumed immediately.

  - When the cellular network (configured as the backup) is connected,
    indicating that the LoRa network (configured as the main) is down, the
    probing mechanism will be disabled to prevent probing LoRa during the
    binary download. Based on the behavior of the cellular network two
    scenarios are possible:
    - Once the download is complete, whether it succeeds or fails, the
      probing mechanism will be resumed.
    - If the cellular network becomes unavailable the tracker will
      attempt to reconnect to the LoRa network (configured as the main
      network) after the network reconnection spacing period expires (since
      the LoRa network is down).

- If the network manager is configured to **LoRa only configuration**:
  The FUOTA request can be received over the LoRa network, and the
  following mechanism is implemented:

  - The cellular network is dynamically configured as a backup, and the
    probing mechanism is disabled.
  - A switch from the LoRa network to the cellular network is triggered:
    - If the cellular network is not connected, the FUOTA process is
      aborted and the LoRa network is immediately resumed.
    - If the cellular network is available, the binary download is
      started.
    - Once the download is complete, whether successful or not, the LoRa
      network is resumed and the backup network configuration is removed.

:::note
Note that in LoRa only configuration, application uplinks will be queued
and not sent over the cellular network. In other words, the cellular
network will be used only for binary downloads. Also, the backup network
notification will not be sent when the cellular network is connected,
since the backup network is not configured by the user.
:::

#### Code transfer

In this phase, the code must run in **RAM**, so all AT3 processing is stopped while the verified firmware is copied into the main MCU flash memory.  
Once complete, the device resets and boots into the new firmware.

### Binary signature

To comply with the new EU security standard **EN 18031** (file authentication), all remote firmware upgrade methods now require **signed firmware**. Signed files are identified by the `.sign` extension.

The signature is a SHA-256 digest of the binary code, encrypted with Abeeway's Elliptic curve DSA (ECDSA) private key. To verify the signature, AT3 calculates the SHA-256 digest of the downloaded binary file then checks the signature validity leveraging the  embedded PKA (Public Key Accelerator) engine.

### Downlink command

### Command line interface

To test FUOTA, the CLI command format is the following:

```console
dfu network <server> <port> <file>
```

For example:

```console
dfu network raw.githubusercontent.com 443 /AbeewayUser/hosting/main/at3-mctcell-release_v1.3-192-*.bin.sign
```

You can check the file download status using the following commands:
`net cell inf mg`
`net info`
