---
sidebar_position: 40
---

# Configuration

This section describes the current AT3 configuration parameters. It
relies on the configuration service, which supports different types of
parameters (integer, float, ASCII string and byte array).

Note: The configuration service does not support parameter names
(parameters only have a numeric identifier) or value ranges. In AT3 it
is the application which provides parameter names as well as acceptable
ranges for each parameter identifier. If the user tries to set parameter
that is out of range, its value is not written.

## Parameter identifiers and groups 

The configuration parameters are grouped per functionality domain. This
eases management, particularly when a configuration change affects a
single group: Registered software components against the configuration
change can decide if the modified parameter group affects them or not.

The parameter identifiers are unique across the entire configuration.
These unique identifiers, called full-identifiers, are built from the
group identifier and the local identifier. The local identifier is
unique only inside a group. The full-identifier is a 16 bits value built
with the most significant byte being the group identifier and the
local-identifier as the least significant byte.

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>Full identifier</strong></td>
    </tr>
    <tr>
      <td>Bits[15..8]</td>
      <td>Bits[7.0]</td>
    </tr>
    <tr>
      <td>Group identifier</td>
      <td>Local identifier</td>
    </tr>
  </tbody>
</table>

Note that in the rest of the document the acronym LID refers to the
Local Identifier within a group and FID refers to the Full identifier.

There are 4 types of parameters:

-   **I**: 32-bit signed integer
-   **F**: 32-bit floating-point number
-   **S**: String, Null-terminated, ASCII encoded, Max 32 chars including Null
-   **B**: Byte array, Max 32 Bytes

Currently, the following groups and parameters are defined. Note that
the parameter identifiers and names can be subject to change before the
first release.

### Internal group

This group is specific because it contains the internal system variables
that need to be preserved across power down and reset. The system reads
from and writes to these variables.

**<a name="Group_00"></a>Group 0. Internal**

| FID    | LID | Type | Name                  | Min  | Max | Dflt | U   | Comments                    |
|--------|-----|------|-----------------------|------|-----|------|-----|-----------------------------|
| 0x0000 | 0   | I    |sys_highest_temperature | -100 | 100 | -100    | 0°C | Highest temperature reached |
| 0x0001 | 1   | I    |sys_lowest_temperature  | -100 | 100 | +100    | 0°C | Lowest temperature reached  |
| 0x0002 | 2   | I    |sys_power_consumption   | 0    | -   | 0    | mAh | Total power consumed        |


To reset the values of the ***sys_highest_temperature***, ***sys_lowest_temperature*** or ***sys_power_consumption***, just write the desired values.
The internal parameter ***sys_power_consumption*** is applicable only to trackers equipped with primary batteries. When replacing these batteries with new batteries, reset the value to 0. For trackers with rechargeable batteries, this parameter should not be modified.

The CLI `config erase` command has the following behavior:

-   `config erase`: The internal parameter group is backed up before the flash is erased and then restored afterward.
-   `config erase all`: When the all keyword is specified, the internal group is not backed up and instead resets to its factory default values.

### System core group

The core group contains the configuration parameters of the system.

**<a name="Group_01"></a>Group 1. System core**

| FID     | LID | Type | Name                         | Min    | Max  | Dflt      | U     | Comments |
|---------|-----|------|------------------------------|--------|------|-----------|-------|----------|
| 0x0100  | 0   | I    | core_monitoring_period       | 15     | -    | 300       | s     | Device monitoring period. |
| 0x0101  | 1   | I    | core_status_period           | 0      | -    | 3600         | s     | Status reporting period. |
| 0x0102  | 2   | B    | core_notif_enable            | \{0..\}  | \{ff..\} | See note  | -     | Notification enable bit map class 0 - 5 |
| 0x0103  | 3   | I    | core_temp_high_threshold     | -100   | 100  | 60        | °C    | Highest temperature detection threshold. |
| 0x0104  | 4   | I    | core_temp_low_threshold      | -100   | 100  | 0         | °C    | Lowest temperature detection threshold. |
| 0x0105  | 5   | I    | core_temp_hysteresis         | -100   | 100  | 5         | °C    | Temperature hysteresis. |
| 0x0106  | 6   | I    | core_button1_map             | 0      | max  | See note  | -     | Button 1 mapping. |
| 0x0107  | 7   | I    | core_button2_map             | 0      | max  | 0         | -     | Button 2 mapping. |
| 0x0108  | 8   | I    | core_buttons_timing          | See note | max  | -       | -     | Button timers (press, long press, debounce). |
| 0x0109  | 9   | B    | core_led0_map                | -      | -    | \{0\}     | -     | LED 0 mapping. |
| 0x010A  | 10  | B    | core_led1_map                | -      | -    | \{0\}     | -     | LED 1 mapping. |
| 0x010B  | 11  | B    | core_buzzer_map              | -      | -    | See note  | -     | Buzzer mapping. |
| 0x010C  | 12  | I    | core_almanac_validity        | 7      | 365  | 120       | days  | Number of days for which the GNSS almanac is considered valid. |
| 0x010D  | 13  | I    | core_almanac_outdated_ratio  | 0      | 100  | 100       | %     | Percentage of outdated GNSS almanac entries that trigger network update requests. A value of 100% disables the network requests. Applicable for both LR11xx and MT33xx GNSS devices. |
| 0x010E  | 14  | I    | core_cli_password            | 0      | max  |  123      | -     | User password for CLI access |
| 0x010F  | 15  | B    | core_db_type_mask            | -      |  -   | See note  | -     | Uplink buffer filter mask |

#### core_monitoring_period
Period at which the device manager measures and manages system variables (temperature, battery level, etc.).  
See [device and power management](./device-power-monitoring) for details.

#### core_status_period
Period at which the status notification is sent. This notification plays the role of the LoRa “live uplink” in AT2.  
See [notifications](./application-uplink#notifications).

#### core_notif_enable
This byte array configures the uplink notification classes and types to be sent via the network. The **index** of the array is the class, and the **value** is a bitmap indicating the notification types inside that class to be sent.  
Each bitmap is encoded as the sum of powers of two: 2<sup>x</sup> for each enabled type *x* (equivalently, `1 << x`).

:::info Examples — notifications to be sent
- **Tamper:** class 0, type 3 → value = 2<sup>3</sup> = `1 << 3` = **8**.  
- **SOS:** class 1, types 0 and 1 (SOS on, SOS off) → value = 2<sup>0</sup> + 2<sup>1</sup> = **3**.  
- **Temperature high:** class 2, type 0 → value = 2<sup>0</sup> = **1**.
:::

**Default value:** enable Uplink buffer, Status, Heartbeat, Low battery, Tamper, Temperature (all), Motion start/end: `{3B,00,07,03,00,00}`

Refer to [notifications](./application-uplink#notifications) for classes and types.

#### core_button1_map and core_button2_map
Define the events generated by button actions. Each event type is coded on 4 bits.

**Map**
- Bits 0–3: Event on button press  
- Bits 4–7: Event on long press  
- Bits 8–11: Event on single click  
- Bits 12–15: Event on double click  
- Bits 16–19: Event on triple click or above  
- Bits 20–23: Event on simple sequence  
- Bits 24–31: RFU

**Event types**
- 0 — No action  
- 1 — Display battery level on LED  
- 2 — Start/Stop SOS  
- 3 — Request a position on demand (POD)  
- 4 — Force an uplink system status notification  
- 5 — Start device  
- 6 — Stop device  
- 7 — Start only SOS  
- 8 — Start BLE advertising for connectivity  
- 9 — Reset the device  
- 10..15 — RFU

**Defaults**
- **core_button1_map:** `0x00000380` (click → POD, long press → start BLE advertising)  
- **core_button2_map:** `0x0`

#### core_buttons_timing
Defines the buttons’ timing parameters. Each part of the bitmap is coded as below.

**Map**
- Bits 0–3: Duration of button press, in **half-seconds**  
- Bits 4–7: Extra duration for long press detection, in **half-seconds**  
- Bits 8–15: Debounce duration for button 1, in **ms**  
- Bits 16–23: Debounce duration for button 2, in **ms**  
- Bits 24–31: RFU

:::note
- The press and long-press timer values are the same for both buttons.  
- If *start device* is not mapped on either **core_button1_map** or **core_button2_map**, the device automatically starts after the startup procedure (skips off mode).  
- If *stop device* is not mapped on either map, the device cannot move to the off state.  
- **core_buttons_timing:** min value **`0x000A0A21`**, default **`0x003232A2`**.  
  - Button press: min 0.5 s, default 3 s  
  - Long press: default extra delay 5 s, **leading** to a total of 6 s  
  - Debounce (buttons 1 & 2): min 10 ms, default 50 ms  
- The button press duration must be **less than** the long-press total duration.  
- The simple sequence (hard-coded) can be used without the special button sequence (14 s press):  
  1) Press for “press duration” (default 3 s)  
  2) Release for “press duration” (default 3 s)  
  3) Press for “press duration” (default 3 s)
:::

#### core_led0_map and core_led1_map
Define the LED patterns to be displayed upon given events.

The byte array is split into **10 slices** of **3 bytes** each; each slice configures a pattern for a system event.

The parameter is defined as:

<html>
<table width="750">
<tbody>
<tr>
<td colspan="3"><strong>Slice 1</strong></td>
<td colspan="3"><strong>Slice 2</strong></td>
<td><strong>...</strong></td>
<td colspan="3"><strong>Slice 10</strong></td>
</tr>
<tr>
<td>Byte 0</td><td>Byte 1</td><td>Byte 2</td>
<td>Byte 0</td><td>Byte 1</td><td>Byte 2</td>
<td>&nbsp;</td>
<td>Byte 0</td><td>Byte 1</td><td>Byte 2</td>
</tr>
<tr>
<td>ext/cls</td><td>type</td><td>pattern</td>
<td>ext/cls</td><td>type</td><td>pattern</td>
<td>&nbsp;</td>
<td>ext/cls</td><td>type</td><td>pattern</td>
</tr>
</tbody>
</table>
</html>

*Where*  
- **ext/cls:** Pattern extension and system event class.  
  - Bits 0–4: Event class (see [Event manager](./event-manager))  
  - Bits 5–6: Pattern loop extension (MSBs)  
  - Bit 7: Pattern inversion — 0: as defined, 1: inverted
- **type:** Event type (see [Event manager](./event-manager))  
- **pattern:** Pattern configuration  
  - Bits 0–3 — Pattern ID:  
    - 0 — None (not configured)  
    - 1 — LED off (duration: infinite)  
    - 2 — LED on (duration: 1 s)  
    - 3 — Fade in (duration: 2.5 s; usually power on)  
    - 4 — Fade out (duration: 2.5 s; usually power off)  
    - 5 — Blink slow: on 1000 ms, off 1000 ms (2 s)  
    - 6 — Blink medium: on 500 ms, off 500 ms (1 s)  
    - 7 — Blink fast: on 250 ms, off 250 ms (0.5 s)  
    - 8 — Flash slow: on 100 ms, off 2 s (2.1 s)  
    - 9 — Flash fast: on 100 ms, off 1 s (1.1 s; usually SOS)  
    - 10 — Heart: on 100 ms, off 250 ms, on 100 ms, off 1 s (1.35 s)  
  - Bits 4–7 — Pattern loop (LSBs): number of repetitions, combined with **loop extension**; a combined value of 0 means infinite.

For more details, see [LED](./user-interface#leds).

#### core_buzzer_map
Defines the buzzer melodies to be played upon given events.

The byte array is split into **10 slices** of **3 bytes** each; each slice configures a melody for a system event.

The parameter is defined as:

<html>
<table width="750">
<tbody>
<tr>
<td colspan="3"><strong>Slice 1</strong></td>
<td colspan="3"><strong>Slice 2</strong></td>
<td><strong>...</strong></td>
<td colspan="3"><strong>Slice 10</strong></td>
</tr>
<tr>
<td>Byte 0</td><td>Byte 1</td><td>Byte 2</td>
<td>Byte 0</td><td>Byte 1</td><td>Byte 2</td>
<td>&nbsp;</td>
<td>Byte 0</td><td>Byte 1</td><td>Byte 2</td>
</tr>
<tr>
<td>ext/cls</td><td>type</td><td>melody</td>
<td>ext/cls</td><td>type</td><td>melody</td>
<td>&nbsp;</td>
<td>ext/cls</td><td>type</td><td>melody</td>
</tr>
</tbody>
</table>
</html>

*Where*  
- **ext/cls:** Melody extension and system event class.  
  - Bits 0–4: Event class (see [Event manager](./event-manager))  
  - Bits 5–7: Melody count extension (MSBs)
- **type:** Event type (see [Event manager](./event-manager))  
- **melody:** Melody configuration  
  - Bits 0–4 — Melody ID:  
    - 0 — None (not configured)  
    - 1 — Melody 1: Off (duration: infinite)  
    - 2 — Melody 2  
    - 3 — Melody 3  
    - 4 — Melody 4  
  - Bits 5–7 — Count (LSBs): number of repetitions, combined with the **count extension**; a combined value of 0 means infinite.

**Default value**  
`{09,03,24,09,01,25,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00}`

The buzzer plays **melody 4** when the tracker is running and **melody 5** when moving to **OFF** mode.

#### core_almanac_validity
Number of days for which the GNSS almanac is considered valid.

#### core_almanac_outdated_ratio
Percentage of outdated GNSS almanac entries that trigger network update requests.  
A value of **100%** disables the network requests.  
Applicable for both **LR11xx** and **MT33xx** GNSS devices.

#### core_cli_password
User password for CLI access.

#### core_db_type_mask
`core_db_type_mask` is a **byte array (7 bytes)** defining the uplink types that should be stored in the **uplink buffer**.

- **Byte 0 — Non-notification uplinks**  
  - **Bit 0:** If set, positions are stored in the history  
  - **Bits 2–7:** Reserved for future use

- **Byte 1 — Notification System class (class 0)**  
  - Each bit corresponds to a notification type in the class. The type must also be enabled in `core_notif_enable`.  
  - Example: `0x0A` → Low-battery and tamper notifications will be stored.

- **Byte 2 — Notification SOS class (class 1)**  
  - Each bit corresponds to a notification type in the class.  
  - Example: `0x01` → SOS On will be stored.

- **Byte 3 — Notification Temperature class (class 2)**  
  - Each bit corresponds to a notification type in the class.  
  - Example: `0x03` → High- and low-temperature notifications will be stored.

- **Byte 4 — Notification Accelerometer class (class 3)**  
  - Each bit corresponds to a notification type in the class.

- **Byte 5 — Notification Network class (class 4)**  
  - Each bit corresponds to a notification type in the class.

- **Byte 6 — Notification Geozoning class (class 5)**  
  - Each bit corresponds to a notification type in the class.

👉 Setting `core_db_type_mask` to `{00,00,00,00,00,00,00}` **disables data buffering**.

### Geolocation engine group

This group configures the geolocation engine local processing.

**<a name="Group_02"></a>Group 2. GEOLOC**

| FID    | LID | Type | Name                       | Min | Max        | Dflt | U  | Comments           |
|--------|-----|------|----------------------------|-----|------------|------|----|--------------------|
| 0x0200 | 0   | I    | geoloc_motion_period       | 10  | 86400      | 300  | s  | Position acquisition period while in motion  |
| 0x0201 | 1   | I    | geoloc_static_period       | 10  | 86400      | 3600  | s  | Position acquisition period while static     |
| 0x0202 | 2   | I    | geoloc_sos_period          | 10  | 86400      | 60  | s  | Position acquisition period while in SOS     |
| 0x0203 | 3   | I    | geoloc_nb_start            | 0   | 10         | 1    | -  | Number of acquisitions on motion start event |
| 0x0204 | 4   | I    | geoloc_nb_stop             | 0   | 10         | 1    | -  | Number of acquisitions on motion stop event  |
| 0x0205 | 5   | I    | geoloc_start_stop_period   | 10  | 86400      | 120  | s  | Interval between position acquisitions while acquiring consecutive positions on motion start or stop |
| 0x0206 | 6   | I    | geoloc_gnss_hold_on_mode   | 0   | 5          | 0    | -  | Selects one of the GNSS hold on modes, see note. |
| 0x0207 | 7   | I    | geoloc_gnss_hold_on_timeout| 0   | 86400      | 0    | s  | GNSS hold on mode timeout, applicable to all hold-on modes except Disabled. 0 disables the Hold-on mode.  |
| 0x0208 | 8   | I    | geoloc_profile0_triggers   | 0   | 0xFFFFFFFF | 0x3D | -  | Geolocation event triggers 0. See note. |
| 0x0209 | 9   | I    | geoloc_profile1_triggers   | 0   | 0xFFFFFFFF | 1    | -  | Geolocation event triggers 1. See note. |
| 0x020A | 10  | I    | geoloc_profile2_triggers   | 0   | 0xFFFFFFFF | 1    | -  | Geolocation event triggers 2. See note. |
| 0x020B | 11  | B    | geoloc_gbe_profile0_techno | -   | -          |      | -  | Technologies to schedule using the basic engine for events in triggers 0. See note. |
| 0x020C | 12  | B    | geoloc_gbe_profile1_techno | -   | -          | -    | -  | Technologies to schedule using the basic engine for events in triggers 1. See note. |
| 0x020D | 13  | B    | geoloc_gbe_profile2_techno | -   | -          | -    | -  | Technologies to schedule using the basic engine for events in triggers 2. See note. |

**geoloc_gnss_hold_on_mode**:
Selects the GNSS hold on mode. Refer to the documentation of the [GNSS Old-on mode](./geoloc-manager#GNSS hold-on mode) for details.
Values:
- 0: **Disabled**.
- 1: **Always**. Hold-on mode always set. Only controlled by the timer.
- 2: **Techno used**: If the gnss is effectively used (i.e. not skipped due to success of higher priority technology).
- 3: **Moving**: Hold-on mode activated only if the tracker is in motion.
- 4: **Static**: Hold-on mode activated only if the tracker is static.
- 5: **Techno used and Moving**: Hold on mode activated only when the GNSS technology is effectively used (i.e. not skipped due to success of higher priority technology) and the tracker is in motion.
In modes 2 and 4, the GNSS is immediately stopped if another location technology (e.g. BLE) has been successful and the GNSS technology is configured to be skipped.

**geoloc_profileX_triggers**: the set bits select the events that
    will be handled according to profile0 (i.e. the sequence of
    technologies defined in geoloc_gbe_profileX_techno):
    -   bit 0: geo_trigger_pod: Geoloc triggered on Position-on-demand
        via downlink or via button.
    -   bit 1: geo_trigger_sos: SOS started
    -   bit 2: geo_trigger_motion_start: Geoloc triggered on motion
        start event
        -   Require the configuration of **geoloc_motion_nb_start** and
        **geo_start_stop_period**
    -   bit 3: geo_trigger_motion_stop: Geoloc triggered on motion stop
        event
        -   Require the configuration of **geoloc_motion_nb_stop** and
        **geo_start_stop_period**
    -   bit 4: geo_trigger_in_motion: Periodic geoloc while the tracker
        is in motion
        -   Require the configuration of geo_motion_period.
    -   bit 5: geo_trigger_in_static: Periodic geoloc running while the
        tracker is static
        -   Require the configuration of geo_static_period.
    -   bit 6: geo_trigger_shock: Geoloc triggered on shock action
        -   Require the shock detection configured (accelerometer)
    -   bit 7: geo_trigger_temp_high_threshold: Geoloc triggered on
        temperature high.
    -   bit 8: geo_trigger_temp_low_threshold: Geoloc triggered on
        temperature low.
    -   bit 9: geo_trigger_geozoning: Geoloc stopped while in monitored
        area. Enabled when leaving the monitored area.

**gbe_profileX_techno**

Each byte represents a technology to schedule, coded as follow:

-   Bit 7: Action Identifier
-   Bits \[6..0\]: Technology Identifier, encoded as a 6-bit unsigned
    integer.

Available actions are:
  
  |          **Identifier**        |      **Action**        |
  |--------------------------------|------------------------|
  |                0               |       Skip_On_Success  |
  |                1               |         Always_Enabled    |
 

-   **Always_Enabled** : the technology must be always scheduled regardless
    of the success or failure of previous technologies.
-   **Skip_On_Success**: The technology should be scheduled only if all
    previous technologies failed to acquire a position, i.e. it will be
    skipped if any of them succeded.

Available technologies are:


|           **Identifier**         |             **Technology**       |
|----------------------------------|----------------------------------|
|                  0               |                   None           |
|                  1               |              LR11xx_A_GNSS       | 
|                  2               |                   WIFI           |
|                  3               |                BLE scan 1        |
|                  4               |                BLE scan 2        |
|                  5               |               aided_GNSS         |
|                  6               |                   GNSS           | 

See also section [Geolocation manager](./geoloc-manager) for details on the geolocation
manager and configuration examples.

Default value for profile 0 (GNSS only): \{06, 00, 00, 00, 00,00\}

### GNSS group 

This group configures the MT3333 GNSS.

**<a name="Group_03"></a>Group 3. gnss**

| FID    | LID | Name                    | Min | Max | Dflt  | U  | Comments |
|--------|-----|-------------------------|-----|-----|-------|----|----------|
| 0x0300 | 0   | gnss_constellation      | 0   | 6   | 2     | -  | GNSS constellations to be used. Supported values:<br />- 0. GPS only<br />- 1. GLONASS only<br />- 2. GPS and GLONASS<br />- 3. GPS and GALILEO<br />- 4. GPS, GLONASS and GALILEO<br />- 5. BEIDOU only<br />- 6. BEIDOU and GPS |
| 0x0301 | 1   | gnss_max_time           | 30  | 300 | 300   | s  | GNSS max acquisition time. |
| 0x0302 | 2   | gnss_t0_timeout_static  | 0   | 300 | 30    | s  | Max time to acquire at least one satellite when the tracker is static. |
| 0x0303 | 3   | gnss_ehpe_static        | 0   | 100 | 20    | m  | Expected Estimated horizontal position error; used when the tracker is static. |
| 0x0304 | 4   | gnss_convergence_static | 0   | 300 | 20    | s  | Extra-time after a first fix to refine the fix. Used when the tracker is static. |
| 0x0305 | 5   | gnss_t0_timeout_motion  | 0   | 300 | 30    | s  | Max time to acquire at least one satellite when the tracker is in motion. |
| 0x0306 | 6   | gnss_ehpe_motion        | 0   | 100 | 30    | m  | Expected Estimated horizontal position error; used when the tracker is in motion. |
| 0x0307 | 7   | gnss_convergence_motion | 0   | 300 | 20    | s  | Extra-time after a first fix to refine the fix. Used when the tracker is in motion. |
| 0x0308 | 8   | gnss_standby            | 0   | -   | 604800 | s  | Max time to let the device in standby mode. |
| 0x0309 | 9   | gnss_agnss_max_time     | 15  | 240 | 45    | s  | Aided GNSS max acquisition time. |
| 0x030A | 10  | gnss_t1_timeout         | 0   | 300 | 0     | s  | Extra time allowed in Aided GNSS mode to try doing a fix. |


### LR11xx group

This group configures the LR1110 GNSS.

**<a name="Group_04"></a>Group 4. LR1110**

| FID    | LID | Type | Name                | Min | Max | Dflt | U  | Comments                                  |
|--------|-----|------|---------------------|-----|-----|------|----|-------------------------------------------|
| 0x0400 | 0   | I    | lr_constellation    | 1   | 6   | 6    | -  | GNSS constellations to be used.           |
| 0x0401 | 1   | I    | lr_scan_mode        | 1   | 2   | 1    | -  | (NAV1 / NAV2)                             |
| 0x0402 | 2   | I    | lr_nb_scans         | 1   | 4   | 2    | -  | Number of scans for one position acquisition |
| 0x0403 | 3   | I    | lr_inter_scan_time  | 0   | 15  | 5    | s  | Time to wait between the scans for a position. |
| 0x0404 | 4   | I    | lr_wifi_report_nb_bssid | 1   | 32  | 4    | -  | Max number of WIFI BSSID per scan.        |
| 0x0405 | 5   | I    | lr_wifi_min_nb_bssid    | 1   | 10  | 3    | -  | Minimum number of BSSID to consider the scan as success (solvable). Below this value the result will be considered not-solvable. **Must be less or equal to lr_wifi_report_nb_bssid.**|
| 0x0406 | 6   | I    | lr_wifi_min_rssi        | -100| 0   | 0    | -  | Minimum RSSI to consider the BSSID. A null value disables the filter.|
| 0x0407 | 7   | I    | lr_wifi_bssid_mac_type  | 0   | 2   | 1    | -  | MAC administration type of the BSSID to report.|

***lr_constellation values***

-   0\. GPS only
-   5\. BEIDOU only
-   6\. BEIDOU and GPS

***lr_scan_mode values***

The LR11xx GNSS firmware implements several variants called "NAV\<X\>",
not all maybe available depending on the loaded firmware:

-   1\. NAV1 scan
-   2\. NAV2 scan

**lr_wifi_bssid_mac_type**
-	0\. All BSSID administration types (universally and locally administered).
-	1\. Universally administered BSSID only.
-	2\. Locally administered BSSID only.

### BLE scan group

There are 2 groups to configure two different BLE scans. Each scan has its own parameter set. Filters are available which are defined as masks
references to the beginning of the Advertising payload (ADV). Refer to section [payload manager](./payload-manager) for details, including offset zero reference for each type of beacon.

**<a name="Group_05"></a>Group 5. BLE\_SCAN1**<br />**<a name="Group_06"></a>Group 6. BLE\_SCAN2**

| FID                              | LID | Type | Name                      | Min   | Max   | Dflt         | U   | Comments  |
|----------------------------------|-----|------|---------------------------|-------|-------|--------------|-----|-----------|
| 0x0500<br />0x0600               | 0   | I    | ble\_scan\_duration       | 50    | 61440 | 3000         | ms  | Total time for a BLE scan                      |
| 0x0501<br />0x0601               | 1   | I    | ble\_scan\_window         | 3     | 10240 | 120          | ms  | Scan window                                    |
| 0x0502<br />0x0602               | 2   | I    | ble\_scan\_interval       | 1     | 10240 | 130          | ms  | Scan interval                                  |
| 0x0503<br />0x0603               | 3   | I    | ble\_scan\_type           | 0     | 7     | 0            | -   | Type of beacons to scan                        |
| 0x0504<br />0x0604               | 4   | I    | ble\_scan\_min\_rssi      | -120  | 0     | -80         | dB  | Min RSSI to consider the beacon                |
| 0x0505<br />0x0605               | 5   | I    | ble_scan_min_nb_beacons   | 1     | 20     | 1          | -   | Min number of beacons to consider the scan as success (solvable). **Below this value the result will be considered not-solvable.  Must be less or equal to ble_scan_nb_beacons.** |
| 0x0506<br />0x0606               | 6   | B    | ble\_scan\_filter1\_mask   | -     | -     | \{0\}       | -   | Mask (10 bytes) to be applied to the ADV frame   |
| 0x0507<br />0x0607               | 7   | B    | ble\_scan\_filter1\_value  | -     | -     | \{0\}       | -   | Comparison value (10 bytes) belonging to filter1 |
| 0x0508<br />0x0608               | 8   | I    | ble\_scan\_filter1\_offset | 0     | 21    | 0           | -   | Offset in the ADV from which we apply the filter1|
| 0x0509<br />0x0609               | 9   | B    | ble\_scan\_filter2\_mask   | -     | -     | \{0\}       | -   | Mask (10 bytes) to be applied to the ADV frame   |
| 0x050A<br />0x060A               | 10  | B    | ble\_scan\_filter2\_value  | -     | -     | \{0\}       | -   | Comparison value (10 bytes) belonging to filter2 |
| 0x050B<br />0x060B               | 11  | I    | ble\_scan\_filter2\_offset | 0     | 21    | 0           | -   | Offset in the ADV from which we apply the filter2|
| 0x050C<br />0x060C               | 12  | I    | ble\_scan\_nb\_beacons     | 1     | 20    | 4           | -   | Number of beacons to report                    |
| 0x050D<br />0x060D               | 13  | I    | ble\_scan\_report\_type    | 0     | 2     | 0           | -   | Scan report type                               |
| 0x050E<br />0x060E               | 14  | I    | ble\_scan\_report\_id\_ofs | 0     | 25    | 4           | -   | Offset in ADV to extract the beacon identifier |

**Note:** ADV means BLE advertisement frame

***ble_scan_type values***

-   0\. All beacons.
-   1\. Eddystone UUID beacons only.
-   2\. Eddystone URL beacons only.
-   3\. All Eddystone beacons.
-   4\. iBeacon beacons only
-   5\. AltBeacon beacons only
-   6\. Custom (only based on filters)
-   7\. Exposure advertisement

***ble_scan_report_type values***

-   0\. MAC address
-   1\. Beacon identifier in short format (2 bytes)
-   2\. Beacon identifier in long format (16 bytes).

Refer to the [Geolocation manager](./geoloc-manager) for the configuration.

### Accelerometer group

This group configures the accelerometer.

**<a name="Group_07"></a>Group 7. Accelerometer**

| FID    | LID | Type | Name                      | Min | Max  | Dflt | U   | Comments|
|--------|-----|------|---------------------------|-----|------|------|-----|---------|
| 0x0700 | 0   | I    | accelero_motion_sensi     | 1   | 96   | 1    | steps  | Motion sensitivity. Resolution: 31 mg per step. |
| 0x0701 | 1   | I    | accelero_motion_duration  | 10  | 3600 | 120  | s   | Motion duration. See note 1. |
| 0x0702 | 2   | I    | accelero_full_scale       | 0   | 3    | 3    | -   | Scale use (2,4,8,16 g). Default 16g for shock detection. See note 2. |
| 0x0703 | 3   | I    | accelero_output_data_rate | 0   | 4    | 0    | -   | Output data rate (12.5, 25, 50, 100, 200 Hz)|
| 0x0704 | 4   | I    | accelero_shock_threshold  | 0   | 128  | 0    | mg  | Shock threshold. Increments of 63 mg. See note 3. |

***accelero_full_scale***

Acceptable values:

-   0\. Scale 2g (preferred for tilt sensing)
-   1\. Scale 4g
-   2\. Scale 8g
-   3\. Scale 16g (preferred for shock detection)

***accelero_output_data_rate***

Acceptable values:

-   0\. 12.5 Hz
-   1\. 25 Hz
-   2\. 50 Hz
-   3\. 100 Hz
-   4\. 200 Hz

:::note
- 1.  The accelerometer chip generates an interrupt to signal the end of motion after 512 consecutive samples without motion—a delay equal to `512 / ODR`. For example, with an ODR (Output Data Rate) of 12.5 Hz, this results in a fixed hardware delay of 40.96 seconds.
The *accelero_motion_duration* parameter is added on top of this hardware delay. For instance, if you configure a motion duration of 60 seconds, the motion-end event will be triggered only after 60 + 40.96 = 100.96 seconds of motion absence.
- 2. The low pass filter is set to ODR/20 for 2G full scale as 2G scale is used for tilt sensing and required elimination of hign frequency vibrations. It is set to ODR/2 for the other scales in order to maximize sensitivity to small vibrations. The sensitivity is capped to 63 for 2G full scale.
- 3. For shock detection, there is no filtering on GADD index level, only on shock level. The back-end application needs to filter based on GADD index value.
:::

### Network group

This group configures the general networking. Refer to section [Networking](./networking) for more details on the AT3 network manager and how it uses these parameters.

**<a name="Group_08"></a>Group 8. Network**

| FID    | LID | Type | Name                          | Min | Max     | Dflt | U   | Comments |
|--------|-----|------|-------------------------------|-----|---------|------|-----|----------|
| 0x0800 | 0   | I    | net_selection                 | 0   | 3       | 0    | -   | Select the networking policy:<br />0: LoRaWAN only<br />1: Cellular only<br />2: LoRaWAN fallback cellular<br />3: Cellular fallback LoRaWAN |
| 0x0801 | 1   | I    | net_reconnection_spacing_static | 0 | Max int | 600  | s   | 0 to disable. When both primary and backup networks are down: interval between connection retry attempts.<br />LoRaWAN only (recommended value: 0): interval between a join failure (lorawan_cnx_timeout) or network-down detection and a new join attempt.<br />Cellular only: interval between an attach failure or network-down detection and reconnection.<br />Applicable when the tracker is **static**. |
| 0x0802 | 2   | I    | net_main_probe_timeout_static   | 120 | Max int | 600 | s   | Interval between retry attempts to the **primary** network while operating on the **backup** network.<br />Available only for the **Combo Compact Tracker**.<br />Applicable when the tracker is **static**. |
| 0x0803 | 3   | I    | net_reconnection_spacing_motion | 0 | Max int | 600 | s   | Same as `net_reconnection_spacing_static`, but applicable when the tracker is **moving**. |
| 0x0804 | 4   | I    | net_main_probe_timeout_motion   | 120 | Max int | 600 | s   | Same as `net_main_probe_timeout_static`, but applicable when the tracker is **moving**. |

#### `net_selection`

##### Policy 0 — LoRaWAN only
When only a LoRaWAN network is available, it is recommended to use the standard-defined Join exponential back-off.  
Set `lorawan_cnx_timeout` (`0x0900`) to **0** so that the Join back-off is not interrupted, and set `net_reconnection_spacing` (`0x0801` and `0x0803`) to **0** to disable any additional reconnection spacing.

:::warning
If you set non-zero values, note that the AT3 logic will consider LoRaWAN as disconnected if joining does not succeed before `lorawan_cnx_timeout`.  
A new Join attempt will then start after the `net_reconnection_spacing` timer expires.  
This retry restarts the exponential back-off from its initial (high-frequency) state, which can significantly impact battery life.
:::
##### Policy 2 — LoRaWAN with cellular backup
:::tip Typical use case
Devices usually in a country/campus with LoRaWAN coverage, occasionally going out of coverage. Vehicle or theft-prevention trackers use this mode to maximize battery life while under LoRaWAN coverage.
:::

The network manager tries to **join LoRaWAN** for up to `lorawan_cnx_timeout` seconds.  
On failure of LoRaWAN, it activates the **cellular backup** network.  
- While connected to **cellular** as backup, it periodically attempts to **rejoin LoRaWAN** every `net_main_probe_timeout_static` / `net_main_probe_timeout_motion` seconds (based on motion state).  
- If cellular is also unavailable, it restarts the process by attempting LoRaWAN again after `net_reconnection_spacing_static` / `net_reconnection_spacing_motion`.

##### Policy 3 — Cellular with LoRaWAN backup
:::tip Typical use case
Devices usually **outside** LoRaWAN coverage but that may occasionally park or be stored in known areas without cellular coverage (e.g., underground parking) where a LoRaWAN network is available.
:::

The network manager tries to **join cellular** for up to `cell_cnx_timeout_static` / `cell_cnx_timeout_motion` seconds (based on motion state).  
On failure of the cellular network, it attempts to **join LoRaWAN** as a backup.  
- While connected to **LoRaWAN** as backup, it periodically attempts to **rejoin cellular** every `net_main_probe_timeout_static` / `net_main_probe_timeout_motion`.  
- If LoRaWAN is also unavailable, it restarts the process by attempting cellular again after `net_reconnection_spacing_static` / `net_reconnection_spacing_motion`.

### LoRaWAN group

This group configures the LoRaWAN networking. Refer to the documentation of the [LoRaWAN networking manager](./networking#lorawan-ani) for more details on the AT3 LoRaWAN manager and how it uses these parameters.

Only LoRaWAN OTA mode is supported in firmware version AT3 (ABP is not as secure and generally considered obsolete). A join is triggered upon initial boot if LoRaWAN is the primary network, or every time LoRaWAN is activated as secondary network. It is also triggered after detection of network loss after failure of lorawan_probe_max_attempts number of link-checks, which are sent only if no downlink message has been received for lorawan_probe_period. All Joins are randomized (the randomization is managed by the LBM stack).

**<a name="Group_09"></a>Group 9. LoRaWAN**

| FID    | LID | Type | Name                       | Min | Max     | Dflt  | U  | Comments      |
|--------|-----|------|----------------------------|-----|---------|-------|----|----------------------|
| 0x0900 | 0   | I    | lorawan_cnx_timeout        | 0   | Max int | 0     | -  | Use only on dual network configurations. Max time to wait for joining the network including all retries (timeout triggers a switch to the back-up network). On LoRaWAN-only configurations, use value 0 to disable this timer|
| 0x0901 | 1   | I    | lorawan_heartbeat_period  | 0   | Max int | 600  | s  | Period at which a heartbeat notification is sent to trigger a Rx window for downlinks (if no uplink has been sent within this period). 0 disables the function. |
| 0x0902 | 2   | I    | lorawan_probe_max_attempts_static | 0   | 20      | 4     | -  | Number of failed link-checks before declaring the network as lost. <br/> Applicable when the tracker is static. 0 disable the function.  |
| 0x0903 | 3   | I    | lorawan_probe_period_static       | 120 | Max int | 43200   | s  | Time between link-check requests, or since last downlink activity. Applicable when the tracker is static. |
| 0x0904 | 4   | B    | lorawan_confirm_notif_map  | \{0\}  | \{FF\}  | \{0\}  | -  | Map enabling the LoRaWAN confirmed message for notifications |
| 0x0905 | 5   | I    | lorawan_confirm_notif_retry| 0   | 15      | 0     | -  | Number of retries for confirmed messages. Value 0: the number of TX follow ADR. |
| 0x0906 | 6   | I    | lorawan_s1_tx_strategy     | 1   | -       | 0x7380E | -  | Socket 1. Transmission strategy |
| 0x0907 | 7   | I    | lorawan_s1_ul_port         | 1   | 252     | 19    | -  | Socket 1. Uplink port |
| 0x0908 | 8   | I    | lorawan_s1_dl_port         | 1   | 252     | 3     | -  | Socket 1. Downlink port |
| 0x0909 | 9   | I    | lorawan_probe_period_motion       | 120 | Max int | 43200   | s  | Time between link-check requests, or since last downlink activity. Applicable when the tracker is moving. |
| 0x090a | 10  | I    | lorawan_probe_max_attempts_motion | 0   | 20      | 4     | -  | Number of failed link-checks before declaring the network as lost. <br/> Applicable when the tracker is moving.  |

:::warning
On multi-network trackers, such as the ***Abeeway Combo Cellular-LPWAN Compact Tracker***, you should set `lorawan_cnx_timeout` to  a non-zero value ***only if there is an active SIM card inserted*** AND a LoRaWAN network is reachable with an active registration.
Otherwise, the device might periodically switch from LoRaWAN to cellular, trying to attach to a network. The LoRAWAN join exponential backoff is reset each time the network switches from cellular to LoRaWAN, causing high frequency joins.
This **network flapping can quickly drain the battery**.
:::

#### TX strategy

The parameter *lorawan_s1_tx_strategy* is a bit-field on 3 bytes
providing the LoRa transmission strategy.

The bitfield is defined as follows:

| Byte #2<br/>Datarates for the 2nd TX  | Byte #1<br/>Datarates for the 1st TX | Byte #0<br/>Control          |
|----------------------|---------------------------------|-------|
| x x x x x x x x       | x x x x x x x x       | 0 0 0 0 D M S A       |

Byte #0 -- Control
-   Bit #0 (A). Set to enable LoRaWAN network ADR control when the
    tracker is static. Reset to disable the network ADR control
    regardless the motion state of the tracker.
-   Bit #1 (S). Control the dual transmission when the tracker is
    static. Set to enable the dual transmission in static state. Reset
    to disable it.
-   Bit #2 (M). Control the dual transmission when the tracker is in
    motion. Set to enable the dual transmission in motion state. Reset
    to disable it in motion state.
-   Bit #3 (D). Control the DR (Datarate) modification for over-sized
    messages. Set to allow AOS to increase the DR for messages not
    fitting the allowed maximum LoRaWAN payload size for a given
    datarate. Reset this flag to prevent sending of over-sized messages.
-   Bit #4-7: Unused.

Byte #1 -- Datarates enabled for the first transmission.
-   Bit #0. Enable datarate DR0. When set, the datarate is enabled.
-   Bit #1. Enable datarate DR1. When set, the datarate is enabled.
-   \...
-   Bit #7. Enable datarate DR7. When set, the datarate is enabled.

Byte #2 -- Datarates enabled for the second transmission.
-   Bit #0. Enable datarate DR0. When set, the datarate is enabled.
-   Bit #1. Enable datarate DR1. When set, the datarate is enabled.
-   \...
-   Bit #7. Enable datarate DR7. When set, the datarate is enabled.

Default: Double transmit for motion and static. TX1: DR3,4,5, TX2: DR0, DR1, DR2.

#### Confirm_notif_map

This byte-array configures the notification classes and uplink types to be sent as LoRaWAN confirmed uplinks. Use confirmed uplinks with care as downlink capacity is limited over LoRaWAN. The index of the array represents the class while the value is a bitmap indicating the notification types inside the class to be acknowledged. The value is so coded as the sum of 2<sup>x</sup>, where x are the types. Example, Notifications to be acknowledged:

-   tamper: Class 0, type 3. Value: 2<sup>3</sup> = 8.

-   SOS:class 1, type 0 and 1 (SOS on, SOS off). Value: 2<sup>0</sup> + 2<sup>1</sup> = 3

-   Temperature high: class 2, type 0. Value: 2<sup>0</sup> = 1

The byte-array will be set to: \{08,03,02,00,00,00\}

Default value: \{00,00,00,00,00,00\}


### Cellular group

This group configures the cellular network. Refer to the documentation of the [cellular networking manager](./networking#cellular-ani) for more details on the AT3 cellular manager and how it uses these parameters.

**<a name="Group_10"></a>Group 10. Cellular**

| FID    | LID | Name                    | Min    | Max      | Dflt     | U   | Comments|
|--------|-----|-------------------------|--------|----------|----------|-----|---------|
| 0x0A00 | 0   | cell_sim_interface      | 0      | 3        | 0        | -   |SIM interface<br/>0: SIM0 (0),<br/>1: e-SIM,<br/>2: reserved for future use.<br/>3: reserved for future use.|
| 0x0A01 | 1   | cell_network_type       | 1      | 2        | 1        | -   |Network type.<br/>· 0: Cellular not used<br/>· 1: LTE-M<br/>· 2: NB-IOT|
| 0x0A02 | 2   | cell_search_bands       | {0}    | See note | See note |     |Radio frequency bands scanned to search a cell. See note.|
| 0x0A03 | 3   | cell_cnx_timeout_static | 180    | 900      | 180      | s   |Maximum search duration for a cellular network. Applicable when the tracker is static.|
| 0x0A04 | 4   | cell_cnx_timeout_motion | 180    | 900      | 300      | s   |Maximum search duration for a cellular network. Applicable when the tracker is in motion.|
| 0x0A05 | 5   | cell_cnx_nw_reconnect_timeout| 0      | 900      | 60       | S   | See note |
| 0x0A06 | 6   | cell_cnx_max_attempts   | 1      | 10       | 3        | -   |Maximum number of times the network search may be repeated before shutting down the modem and passing control to the network manager.|
| 0x0A07 | 6   | cell_access_point_name  | -      | -        | ""       | -   |String (max 32 bytes) providing the service access point name (APN). If not provided, this information is retrieved from the SIM.|
| 0x0A08 | 8   | cell_operator_sim_slot_0| -      | -        | ""       | -   |Cellular operator name when using SIM0|
| 0x0A09 | 9   | cell_operator_sim_slot_1| -      | -        | ""       | -   |Cellular operator name when using SIM1 (E.SIM).|
| 0x0A0A | 10   | cell_low_power_mode     | 0      | 3        | 0        | -   |Low power mode:<br/>· 0: disabled.<br/>· 1: PSM<br/>· 2: eDRX<br/>· 3. both PSM and eDRX.|
| 0x0A0B | 11  | cell_psm_tau_period     | 0      | 255      | 24       | -   |Bit-field giving the requested TAU period.|
| 0x0A0C | 12  | cell_psm_active_time    | 0      | 255      | 2        | -   |Bit-field giving the requested active time.|
| 0x0A0D | 13  | cell_edrx_pcl           | 0      | 15       | 15       | -   |Requested paging cycle length|
| 0x0A0E | 14  | cell_edrx_ptw           | 0      | 15       | 3        | -   |Requested paging time window|
| 0x0A0F | 15  | cell_rai_timeout        | 0      | 10000    | 500      | ms  |RAI (Release Assistance Indication) timeout. A null value disables the feature. **Use only with UDP protocol**.|
| 0x0A10 | 16  | cell_probe_max_attempts | 0      | 10       | 0        |     | Number of failed echo-request probes before declaring the network as lost. 0 disables the feature.|
| 0x0A11 | 17  | cell_probe_period       | 120    | Max int  | 600      | s   | The time interval between echo requests or since the most recent downlink activity. It is advisable to set this value higher than the aggregation timer.|
| 0x0A12 | 18  | cell_s1_transport_proto | 0      | 1        | 1        | -   |Socket 1 transport protocol:<br/>· 0: TCP (Do not use unless instructed by Abeeway) <br/>· 1: UDP|
| 0x0A13 | 19  | cell_s1_ip_url_addr     | -      | -        | ""       | -   |Socket 1 remote IP address or FQDN in string format (max 32 bytes)|
| 0x0A14 | 20  | cell_s1_dst_ip_port     | 0      | 65535    | 0        | -   |Socket 1 destination UDP/TCP port number.|
| 0x0A15 | 21  | cell_s1_src_ip_port     | 0      | 65535    | 0        | -   |Socket 1 local UDP/TCP port number. Value 0 means that the modem will choose one.|
| 0x0A16 | 22  | cell_s1_tx_aggr_time    | 0      | 3600     | 120      | s   |Duration in second for which the messages are buffered in the socket 1 transmit queue before being transmitted.|
| 0x0A17 | 23 | cell_apn_user_id         | -      | -        | ""       | -   | String that specifies the user identifier (username) used for authentication with a private APN. |
| 0x0A18 | 24 | cell_apn_user_pwd        | -      | -        | ""       | -   | String that specifies the user password used for authentication with a private APN. |
| 0x0A19 | 25 | cell_apn_auth_protocol   | 1      | 2        | 1        | -   | Specifies the authentication protocol used for establishing the private APN connection.<br/> 1: PAP (Password Authentication Protocol)<br/> 2: CHAP (Challenge-Handshake Authentication Protocol) |
| 0x0A1A | 26 | cell_fuota_server_ip_url_addr | -  | -        | ""       | -   | FUOTA server IP/URL in string format (max 32 bytes) |

#### cell_cnx_nw_reconnect_timeout

Interval between reconnection attempts: When the modem loses the network connection, an auto-reconnect timeout is triggered to allow the modem to recover the network connection on its own. There are no retries for an administrative disconnect reason, otherwise there are up to cell_cnx_max_attempts retries. After this the network manager will attempt to use the fallback technology if any, and try to reconnect to the primary technology with interval net_reconnection_spacing, which is expected to be larger than cell_cnx_nw_reconnect_timeout.

#### cell_s1_ip_url_addr and cell_s1_dst_ip_port

Depending on your platform, you can use one of the following FQDNs as destination for AT3 UDP packets. The tracker will be managed by ThingPark X Location Engine (TPX-LE) and you will be able to use the Abeeway Device Manager tool.
- Community platform: udp-eco.thingpark.com
- EU SaaS: udp-eu.thingpark.com 
- US SaaS: udp-us.thingpark.com
- AU SaaS: udp-au.thingpark.com

The destination port is 5007 for all platforms.

#### Search bands

This byte array parameter contains the list of cellular bands (**encoded
in hexadecimal form, e.g. band 28 is coded as 0x18**) to scan to find an
appropriate cell.

:::note
-   Filling this array to 0 instructs the modem to scan all possible
    bands.
-   The array must end by a null value
-   Default value:
    -  \{01,03,08,13,14,1C,00,00,00,00,00,00,00,00,00,00,00,00,00\}
-   Supported bands
    -  \{01,02,03,04,05,08,0C,0D,0E,11,12,13,15,19,1A,1C,42,47,55\}
:::

#### Active time bit-field

The Active Period Timer (3GPP T3324) defines how long the device stays reachable by the network in Idle mode after transmitting data, before entering deeper sleep states such as PSM.

It starts after the device enters Idle mode following RRC release or after sending data. While the timer runs, the UE stays reachable using extended DRX (eDRX) paging cycles. 
When T3324 expires, the UE transitions into PSM (Power Saving Mode) and is no longer reachable until it wakes for periodic TAU.

The device requests a target Active timer (typically very short to minimize power consumption), but the network confirms the value during Attach Accept or TAU Accept. The negociated TAU value can be checked using CLI command "net cell info driver". 

Your application server must be designed to send any downlink command within the Active Period, after each uplink. 

:::note
The modem remains active much longer than the configured Active Period, due to the wake-up latency from deep sleep (~2s), the signalling overhead (5 to 60s depending on network conditions), and the sleep latency (~1s). you should account for this overhead when estimating power consumption.
:::

Bits 4 to 0 represent the binary coded timer value and bits 5 to 7 the
timer value unit .

| B7 | B6 | B5 | Timer value unit                                  |
|----|----|----|----------------------------------------------------|
| 0  | 0  | 0  | Value is incremented in multiples of 2 seconds      |
| 0  | 0  | 1  | Value is incremented in multiples of 1 minute       |
| 0  | 1  | 0  | Value is incremented in multiples of deci-hours     |
| 1  | 1  | 1  | Value indicates that the timer is deactivated.      |

#### TAU Time bit-field

The Tracking Area Update (TAU) timer (3GPP T3412) defines how long the device can remain idle before it must contact the network again to confirm its presence and maintain mobility management context.

When the timer expires, the device must initiate a TAU Request to the network. During the interval, the device can remain in energy-saving modes such as PSM (Power Saving Mode).

The device requests the TAU value as configured in cell_psm_tau_period, but the network may shorten it during Attach Accept or TAU Accept messages. The negociated TAU value can be checked using CLI command "net cell info driver".
Longer TAU values reduce signaling but increase the risk that the network purges the UE context if the device misses the update.

Bits 4 to 0 represent the binary coded timer value and bits 5 to 7 the
timer value unit.

| B7 | B6 | B5 | Timer value unit                                  |
|----|----|----|----------------------------------------------------|
| 0  | 0  | 0  | Value is incremented in multiples of 10 minutes     |
| 0  | 0  | 1  | Value is incremented in multiples of 1 hour         |
| 0  | 1  | 0  | Value is incremented in multiples of 10 hours       |
| 0  | 1  | 1  | Value is incremented in multiples of 2 seconds      |
| 1  | 0  | 0  | Value is incremented in multiples of 30 seconds     |
| 1  | 0  | 1  | Value is incremented in multiples of 1 minute       |
| 1  | 1  | 0  | Value is incremented in multiples of 320 hours      |
| 1  | 1  | 1  | Value indicates that the timer is deactivated       |

#### eDRX PCL and PTW bit-field

The eDRX parameters PCL (Paging Cycle Length) and PTW (Paging Transmission Window) are each encoded on 4 bits.


| B3‍ | B2 | B1 | B0 | PCL duration in seconds | WB-S1 (LTE-M) PTW value in seconds | NB-S1 (Nb-IoT) PTW value in seconds |
|-----|----|----|----|-------------------------|------------------------------------|-------------------------------------|
| 0‍  | 0  | 0  | 0  | 5.12 (see note 1)       | 1.28                               | 2.56                                |
| 0‍  | 0  | 0  | 1  | 10.24 (see note 1)      | 2.56                               | 5.12                                |
| 0‍  | 0  | 1  | 0  | 20.48                   | 3.84                               | 7.68                                |
| 0‍  | 0  | 1  | 1  | 40.96                   | 5.12                               | 10.24                               |
| 0‍  | 1  | 0  | 0  | 61.44 (see note 2)      | 6.40                               | 12.80                               |
| 0‍  | 1  | 0  | 1  | 81.92                   | 7.68                               | 15.36                               |
| 0‍  | 1  | 1  | 0  | 102.40 (see note 2)     | 8.96                               | 17.92                               |
| 0‍  | 1  | 1  | 1  | 122.88 (see note 2)     | 10.24                              | 20.48                               |
| ‍1‍ | 0  | 0  | 0  | 143.36 (see note 2)     | 11.52                              | 23.04                               |
| ‍1‍ | 0  | 0  | 1  | 163.84                  | 12.80                              | 25.60                               |
| ‍1‍ | 0  | 1  | 0  | 327.68                  | 14.08                              | 28.16                               |
| ‍1‍ | 0  | 1  | 1  | 655.36                  | 15.36                              | 30.72                               |
| ‍1‍ | 1  | 0  | 0  | 1310.72                 | 16.64                              | 33.28                               |
| ‍1‍ | 1  | 0  | 1  | 2621.44                 | 17.92                              | 35.84                               |
| ‍1‍ | 1  | 1  | 0  | 5242.88 (see note 3)    | 19.20                              | 38.40                               |
| ‍1‍ | 1  | 1  | 1  | 10485.76 (see note 3)   | 20.48                              | 40.96                               |

:::note
- **1**: The value is applicable only in WB-S1 (LTE-M) mode. If used in NB-S1 (NB-IoT) mode, it will cause the modem to fail.
- **2**: The value is applicable only in WB-S1 (LTE-M) mode. If used in NB-S1 (NB-IoT) mode, it is interpreted as “0010”, equivalent to 20.48 seconds.
- **3**: The value is applicable only in NB-S1 (NB-IoT) mode. If used in WB-S1 (LTE-M) mode, it is interpreted as “1101”, equivalent to 2621.44 seconds.
:::

### BLE group

This group configures the BLE parameters.

**<a name="Group_11"></a>Group 11. BLE**

| FID    | LID | Type | Name                         | Min | Max      | Dflt | U   | Comments                                                                 |
|--------|-----|------|------------------------------|-----|----------|------|-----|---------------------------|
| 0x0B00 | 0   | I    | ble_cnx_tx_power             | 0   | 31       | 19   | -   | BLE Tx power level, see table below. |
| 0x0B01 | 1   | I    | ble_cnx_adv_duration         | 30  | Max int  | 60   | s   | Time to wait before stopping advertising or switching to slow advertising. |
| 0x0B02 | 2   | I    | ble_cnx_behavior             | 0   | 4        | 1    | -   | The connectivity configuration. |
| 0x0B03 | 0   | I    | ble_beacon_tx_power          | 0   | 31       | 19   | dBm | BLE Tx power level for beaconing. |
| 0x0B04 | 1   | I    | ble_beacon_type              | 0   | 5        | 0    | -   | Beacon Type to start. |
| 0x0B05 | 2   | B    | ble_beacon_identifier        | -   | -        | {}   | -   | BLE beaconing ID parameter, array of 16 to 24 bytes depending on beacon type. |
| 0x0B06 | 3   | I    | ble_beacon_fast_adv_interval | 20  | 10240    | 333  | ms  | BLE beacon fast advertising interval. |
| 0x0B07 | 4   | I    | ble_beacon_slow_adv_interval | 20  | 10240    | 1000 | ms  | BLE beacon slow advertising interval. |


#### cnx tx power level

The user can specify the desired TX power via the ble_cnx_tx_power
parameter, representing the TX level as defined by ST microelectronics
for the STM32WB55, the correspondence between TX power level and TX
power dBm is as follows:

| **Level** | **dBm**     | **Level** | **dBm**     | **Level** | **dBm**    | **Level** | **dBm**    | **Level** | **dBm**    | **Level** | **dBm** |
| ----- | ------- | ----- | ------- | ----- | ------ | ----- | ------ | ----- | ------ | ----- | --- |
| 0x00  | \-40    | 0x06  | \-15.25 | 0x0C  | \-8.85 | 0x12  | \-3.15 | 0x18  | \-0.15 | 0x1E  | +5  |
| 0x01  | \-20.85 | 0x07  | \-14.1  | 0x0D  | \-7.8  | 0x13  | \-2.45 | 0x19  | 0      | 0X1F  | +6  |
| 0x02  | \-19.75 | 0x08  | \-13.15 | 0x0E  | \-6.9  | 0x14  | \-1.8  | 0x1A  | +1     |       |     |
| 0x03  | \-18.85 | 0x09  | \-12.05 | 0x0F  | \-5.9  | 0x15  | \-1.3  | 0x1B  | +2     |       |     |
| 0x04  | \-17.6  | 0x0A  | \-10.9  | 0x10  | \-4.95 | 0x16  | \-0.85 | 0x1C  | +3     |       |     |
| 0x05  | \-16.5  | 0x0B  | \-9.9   | 0x11  | \-4    | 0x17  | \-0.5  | 0x1D  | +4     |       |     |

#### cnx adv duration

This parameter defines the duration of the fast advertising timer. When the device initiates connectivity, it starts with fast advertising parameters, with the fast advertising interval set to 500ms.

When the device is connected to a mobile app, the fast advertising timer is stopped, and a new timer (ble_timer) is started for 60 seconds to allow the mobile app to proceed with the bonding procedure. If the ble_timer expires, the device will disconnect and restart fast advertising.

After the fast advertising timer expires, depending on the configuration and the BLE bonding status, the device either switches to slow advertising or stops BLE connectivity.

<table>
  <tr>
    <th>ble_cnx_init_config</th>
    <th>Bond exist</th>
    <th>No bond</th>
  </tr>
  <tr>
    <td>enable_no_passkey</td>
    <td rowspan="2">Switch to slow advertising</td>
    <td rowspan="2">Connectivity stopped</td>
  </tr>
  <tr>
    <td>enable_passkey</td>
  </tr>
  <tr>
    <td>enable_no_passkey_no_slow_adv</td>
    <td colspan="2" rowspan="2">Connectivity stopped</td>
  </tr>
  <tr>
    <td>enable_passkey_no_slow_adv</td>
  </tr>
</table>

Slow advertising interval is set to 2 seconds.

#### cnx behavior

This parameter is used to define the behavior of the connectivity in
terms of passkey usage and the actions to take after the fast
advertising timer is triggered.

| **ble_cnx_init_config**       | **Value** | **Comment**  |
| -----------------------------|--------- |----|
| Disable                       | 0         | \- BLE connectivity not started when the device is turned ON  |
| enable_no_passkey             | 1         | \- BLE connectivity started when the device is turned ON <br/> \- No passkey needed to establish a secure connection |
| enable_passkey                | 2         | \- BLE connectivity started when the device is turned ON <br/> \- Passkey needed to establish a secure connection  |  
| enable_no_passkey_no_slow_adv | 3         | \- BLE connectivity started when the device is turned ON <br/> \- No passkey needed to establish a secure connection <br/> \- Switch to BLE Idle state when the fast advertising timer is triggered (Slow advertising disabled) |
| enable_passkey_no_slow_adv    | 4         | \- BLE connectivity started when the device is turned ON <br/> \- Passkey needed to establish a secure connection <br/> \- Switch to BLE Idle state when the fast advertising timer is triggered (Slow advertising disabled)    |

:::tip
When using a passkey, the PIN code is derived from the Unique Device Number of the LR1110 LoRa transceiver modulo 0x80000, resulting in a PIN code value between 000000 and 524287.
You can find the value of the LR11XX UID by typing the `net lora info driver` command line:
```
user> net lora info driver
net lora info driver
LoRa driver information
 Versions
  LoRa: 1.0.4.1
[...]
 EUIs
  DevEUI: 20635ff20000a806
  JoinEUI: f03d29ac71010001
  LR11XX UID: 0016c001f00b1dc1
 [...]
 
```
The passkey is computed as follows:
```c
passkey = (uid[4] << 24 | uid[5] << 16 | uid[6] << 8 | uid[7]) & 0x7FFFF;
```
:::

#### Beacon tx power level

Beaconing Tx power level, same as **cnx tx power level**.

#### Beacon type

| **Beacon type** | **Value** | **Comment**                     |
| --------------- | --------- | ------------------------------- |
| Disabled        | 0         | Beaconing disabled              |
| Eddystone UID   | 1         | Eddystone UUID beacon emulation |
| I-Beacon        | 2         | I-Beacon beacon emulation       |
| AltBeacon       | 3         | AltBeacon beacon emulation      |
| QUUPPA          | 4         | QUUPPA beacon emulation         |
| Exposure        | 5         | Exposure beacon emulation       |

#### Beacon identifier

This parameter will host the data to advertise in beaconing mode, the
maximum size of this parameter is 24 bytes and minimum size is 16 bytes.

The data to advertise and the data size depends on the beacon type:

-   Eddystone UID: 10 bytes of namespace followed by 6 bytes of
    instance.
-   Ibeacon: 16 bytes for the UUID followed by 2 bytes for major
    number and 2 bytes for minor number.
-   Altbeacon: 4 bytes for manufacturer ID followed by 20 bytes for
    beacon ID.
-   QUUPPA: 1 byte for compensated Tx power followed by 6 bytes for
    identifier.
-   Exposure: 16 bytes for random public identifier followed by 4 bytes
    for meta data.

By default the data is set to 0.

#### Beacon fast advertising interval

The fast advertising interval is used when the device is in motion
state.

#### Beacon slow advertising interval

The slow advertising interval is used when the device is in static
state.

## Configuration parameter checksums (CRCs)

### CRC algorithm
The CRC algorithm is provided in C code.

```c
#define CFG_INIT_CRC 0xFFFFFFFA
static uint32_t _cfg_do_crc(uint32_t crc,  uint8_t* buf, int len )
{
    while( len-- > 0 ) {
        crc = crc ^ *buf++;
        for( int i = 0; i < 8; i++ ) {
            uint32_t mask = -( crc & 1 );
            crc           = ( crc >> 1 ) ^ ( 0xEDB88320 & mask );
        }
    }
    return ~crc + 3;
}
```

Note that before calling the function, the CRC parameter should be initialized to the value CFG_INIT_CRC.

### Calculating the CRC for a parameter

A configuration parameter contains a descriptor and the value defined as follows:

```c
/*!
 * \brief Value of a parameter
 */
typedef union {
    int32_t integer;			//!< Signed integer
    float decimal;			//!< Floating point
    char* ascii;				//!< Pointer to an ASII char (NULL terminated)
    uint8_t* barray;			//!< Pointer to an array of bytes
} srv_config_param_value_t;

/*!
 * \brief Parameter descriptor
 *
 * \warning Do not change the order
 */
typedef struct {
	struct {
		uint16_t identifier;    //!< Unique parameter identifier
		uint8_t type;          //!< Value type refer to srv_config_param_type_t
		uint8_t length;        //!< string length of the barray value
	} descriptor;		     //!< Descriptor associated to the parameter
    srv_config_param_value_t value;  //!< Parameter value
} __attribute__((__packed__)) srv_config_param_descriptor_t;
```
The CRC  of a parameter is calculated over:
-	The full descriptor (srv_config_param_descriptor_t) for integer and floating point types.
-	The descriptor length is set to 0 for all parameter types except for byte array.
-	The descriptor only (descriptor) followed by the value pointed by the value field for barray and string types. The byte array size is given by the length field of the descriptor.
-	The CRC for a string includes the null char (C string termination). The length should be determined (strlen() + 1) and not extracted from the descriptor.

### Calculating the CRC for a single group
A parameter group CRC is calculated over all parameters belonging to the group. Note that the CRC must be initialized only once before starting the CRC calculation of all parameters.

Notes
-	The parameter ordering must be respected.
-	A missing parameter must be skipped for the CRC calculation.

###	Calculating the global CRC
The global CRC is calculated over all parameter groups except the internal one. Note that the CRC must be initialized only once before starting the CRC calculation of all groups.
Notes
-	The parameter group ordering must be respected.
-	A non-existent group must be skipped for the calculation (e.g. For non combo-compact tracker, the cellular group does not exist).


## Configuration file

### Overview

AT3 supports a configuration file appended to the firmware binary. The
configuration file contains:

-   A header including the keyword CONFIGURATION followed by the VERSION
    keyword and its version number.
-   The list of the parameters that differs from the hard-coded ones.
-   A trailer indicating the end of the configuration

Each parameter is addressed by its full identifier coded in hexadecimal
and prefixed with the letter **P**. The full identifier must contains
all 4 digits.

Examples

-   **P0102** is a valid identifier (parameter group 1, local identifier
    2), while **P102**, **P12** are not a valid. .

**P0000** is a valid identifier (parameter group 0, local identifier 0),
while any other writing for this parameter identifier is invalid.

**Important notes**

-   All keywords as well as the parameter identifier prefix must be in
    upper case.
-   There can be only one keyword per line.
-   There can be only one parameter per line
-   Each line is ended by a CR or LF or both.


### Version format

The configuration version starts on a single line starting with the
keyword VERSION followed by a space and the version number.

The number contains 4 fields separated by a dot.The general format is
Major.minor.iteration.user.

Example

VERSION 1.0.0.1

The meaning and the management of the version is described hereafter in
section [Configuration management](#configuration-management).

### Parameter format

There is a single parameter setting per line. The line is composed by:

-   The parameter full identifier prefixed by the letter P
-   The equal sign, separating the identifier from its value
-   The desired value of the parameter

Note that spaces may be inserted before and after the equal sign.

AT3 uses several parameter types. They are automatically discovered
based on the value syntax:

-   An integer value type is detected if it contains only numerical
    digits \[0..9\].

> Examples: 123, 0141, 1234 are valid integer numbers.

-   An hexadecimal value is detected if the value starts with 0x and
    numerical digits \[0..9\] or letters \[a..f\] or \[A..F\] only
    follows the 0x prefix.

> Examples: 0x12aa, 0x45678, 0xFF123 are valid.

-   A decimal number must contain a dot. Ie value 1 must be configured
    as "1.0."

> Examples: 1.23, 11234.0, 12345 are valid.

-   An ASCII string must be enclosed by the double quote ("). A string
    cannot include a double quote and cannot exceed 31 characters. Empty
    strings are supported.

> Examples: "abeeway", "Hello word", "" are valid.

-   A byte array must start with the opening bracket (\{) and end with
    the closing bracket (\}). Each value is expressed in hexadecimal on 2
    digits and separated by a comma (,). No space are allowed between
    the 2 brackets. The hexadecimal value is not prefixed with 0x.

> Examples: \{00, 01,aa,ff,BB,1C\} is valid.


### Configuration file example

In this example, we modify the parameters core_status_period (0x0102),
geoloc_motion_period (0x0200), geoloc_static_period (0x0201),
geoloc_start_stop_period (0x0205) and geoloc_gbe_profile0_techno
(0x020b).

CONFIGURATION

VERSION 1.0.0.1

P0102=900

P0200= 800

P0201 =300

P0205 = 0x125

P020b = \{02,85,00,00,00\}

END

## Configuration management

### Overview

The versioning control field of a configuration allows to check its
compatibility with the firmware, and also provides indications for the
intended use.

The versioning control field is coded as follows:

\<Major\>.\<Minor\>.\<Iteration\>.\<User\>

\<Major\>.\<Minor\> reflect the first (oldest) firmware version
compatible with this configuration. Firmware with the same major version
and same or higher minor versions will also be compatible with this
configuration as Abeeway ensures upward compatibility within a given
major version. A change of major version may break such compatibility
(for example it may change the type of a parameter).

\<Iteration\> is intended to capture the serial number of
configurations, and it is expected that it will be incremented at each
change.

\<User\> is a free field, but the intended use is to identify a specific
use case or context, and allow the people in charge of device management
to rapidly check whether a configuration was designed for the specific
use case. Abeeway will use \<User\>=0 for its generic product
configurations out of factory.

Firmware upgrade behavior:

-   FW1/ If the new firmware major version is the same as the current
    configuration stored in flash memory, and the minor version of the
    firmware is the same or higher, the flash configuration is valid and
    will be used. Configuration defined values will replace the default
    values of the firmware.

-   The flash configuration \<Minor\> will be updated  to match the one
    of the new firmware (as the new firmware may update a parameter, we
    can no longer guarantee the compatibility of the configuration with
    the previous firmware).

-   FW2/ In all other cases, the current flash configuration is erased,
    and the firmware will use the default new firmware configuration.
    Implicitly the versioning control field of this default
    configuration is \<FW_Major\>.\<MW.Minor\>.0.0

Configuration update behavior

-   The following must be both true:

    -   The new configuration \<Major\> must be identical to the flash
        configuration \>Major\> (which itself always matches the running
        firmware Major due to rule FW2).

    -   The new configuration \<Minor\> must be lower or equal to the
        flash configuration \<Minor\>, which itself always matches the
        running firmware Minor due to rule FW1).

> If it is not the case, the configuration is rejected, as a firmware
> upgrade is required first to ensure compatibility with the
> configuration.
>
> If both checks pass the configuration is accepted.

-   If the configuration command flag is "replace" then the flash
    configuration is first erased and replaced with the new parameters.
    Parameters not specified in the new configuration return to their
    firmware-defined default values.

-   If the configuration command flag is "patch" and either
    \<Iteration\> or \<User\> differ from the current configuration,
    then the configuration is updated with the new parameters,

-   The flash \<Iteration\> and \<User\> elements are updated to match
    the new configuration.

Note that in the case of FUOTA FW upgrade which may also include a
configuration, the order of execution is the following:

> 1/ Firmware upgrade and merge of current config with rules FW1 and FW2
>
> 2/ Configuration upgrade (and therefore at the time, the running
> firmware version is the new FUOTA upgraded firmware).


### Configuration commands and actions

The configuration in flash can be reset to the default values at any
time. This action can be done via the CLI command, the network command
or the bootloader:

-   The networking integrates a command, which clears and resets the
    tracker (refer to the [downlink commands](application-downlink#commands)).
-   The Bootloader includes the command **ABWe**, which erases the flash
    segment containing the configuration. Once reset, this flash section
    will be recreated by the application.
-   The CLI commands **config erase** and **system reset**, respectively
    erase and reformat the flash and reset the device.
