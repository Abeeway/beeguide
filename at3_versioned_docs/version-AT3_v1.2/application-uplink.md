---
keywords: [ AT3, AT3_v1.2 ]
sidebar_position: 11
---

# Application uplinks

This section defines the frame format of uplinks sent to the network.
The network can be either LoRaWAN or LTE.

Most of the messages are sized to fit the maximum LoRa payload size in
the worst case (DR0), which is 51 bytes for EU-868 (repeater
compatible). Note that only responses to a query can exceed this limit
and restrict the MTU to 63, which may trigger a datarate change if
configured in tx_start paramters.

## Cellular network header

**On cellular network only**, the following message header is added:

| **Bytes [0-7]** | **Bytes [8-9]**                  |                  |
|-----------------|----------------------------------|------------------|
| -               | **b15-0**                        | **b7-0**         |
| DevEUI          | MSB Frame up counter            | LSB Frame up counter |

***Byte 0-1 description***

-   **DevEUI.** Device unique identifier. Used on cellular networks to
    discriminate the device which sent the uplink. For convenience, it
    is identical to the LoRaWAN DevEUI.

-   **Frame up counter**. Uplink frame counter. Incremented for each
    uplink. It wraps to 0 after reaching 65535. It is an emulation of
    the LoRaWAN uplink frame counter and serves the same purpose: to be
    able to detect and quantify uplink packet loss when using UDP
    transport.


## Message header

The uplinks are structured with a common header followed by a data
section. The data section varies depending on the type of uplink.

### Basic header

The basic header has 4 bytes and is present in both single-frame and
multi-frame modes.

<table>
  <tbody>
    <tr>
      <td colspan="4"><strong>Byte 0</strong></td>
      <td colspan="2"><strong>Byte 1</strong></td>
      <td colspan="2"><strong>Bytes [2-3]</strong></td>
    </tr>
    <tr>
      <td><strong>b7</strong></td>
      <td><strong>b6</strong></td>
      <td><strong>b5-3</strong></td>
      <td><strong>b2-0</strong></td>
      <td><strong>b7</strong></td>
      <td><strong>b6-0</strong></td>
      <td><strong>b15-0</strong></td>
      <td><strong>b7-0</strong></td>
    </tr>
    <tr>
      <td>M</td>
      <td>S</td>
      <td>Type</td>
      <td>ACK-TK</td>
      <td>F</td>
      <td>Battery %</td>
      <td>MSB timestamp</td>
      <td>LSB timestamp</td>
    </tr>
  </tbody>
</table>


***Byte 0 description***

-   **M**. Multi-frame (0: single frame; 1: multi-frame).
    -   0 - Single frame.
    -   1 -- Multi-frame
-   **S**. SOS.
    -   0 --SOS mode not active
    -   1 -- SOS mode active
-   **Type**. Frame type.:
    -   1 -- **Notification**. Unsolicited message (System start,
        Critical/normal temperature, motion start/stop, SOS start/stop,
        geozoning, battery alert, etc.).
    -   2 -- **Position**. Unsolicited message. Geolocation positions.
    -   3 -- **Query**. Expects a response from the network (aiding
        position request, almanac request, etc.).
    -   4 -- **Response**: Solicited message. Response to network query
        (config get/set, POD, Almanac get/set, etc.).
    -   Other values: Reserved for future use.
-   **ACK-TK**: Ack-token. Value (in \[0..7\]) extracted from the last
    downlink received. It is used to acknowledge the corresponding
    downlink.

***Byte 1 description***

-   **F**. Free for use
-   **Battery**: Remaining battery capacity expressed as percentage of
    full capacity. Special values:
    -   0: **in charge**
    -   127: **unknown**.
***Byte 2 -- 3*** contains the timestamp indicating when the payload was
generated. The value represents the number of seconds elapsed since the
start of the most recent half-day period (a value of 0 corresponds to
either noon or midnight).

### Extended header

This header is used when an application message needs to be fragmented
to multiple uplinks ("multi-frame" case).

It consists of a basic header (with M = 1) extended with an extra byte
called m-frame.

<table>
  <tbody>
    <tr>
      <td><strong>Bytes [0-3]</strong></td>
      <td colspan="3"><strong>Byte 4</strong></td>
    </tr>
    <tr>
      <td>Basic header with M=1</td>
      <td>Group</td>
      <td colspan="2">m-frame</td>
    </tr>
    <tr>
      <td rowspan="2"></td>
      <td>b7-5</td>
      <td>b4</td>
      <td>b3-0</td>
    </tr>
    <tr>
      <td>Group ID</td>
      <td>Last</td>
      <td>Fragment number</td>
    </tr>
  </tbody>
</table>


***Byte 4 description***

-   **Group ID**. Group identifier \[0..7\]. It is incremented each time
    a new group of uplinks are sent. It is used to uniquely identify a
    group. It should be used to avoid mixing uplinks belonging to two
    different groups.

-   **Last**. Set to 1 to indicate the last uplink in the group.

-   **Fragment number**. Fragment identifier inside a group \[0..15\].
    It starts at 0 (first uplink) and is incremented for each subsequent
    uplinks belonging to the same group.

## Notifications

This section describes the notification uplinks.

### Overview

The notifications are categorized into classes, with each class
containing different types. The class of notification allows a simple
mechanism (and configuration) for requesting network acknowledgments: A
user may require some classes of notifications to be acknowledged by the
network.

The format of a notification is the following

<table>
  <tbody>
    <tr>
      <td><strong>Bytes [0-3]</strong></td>
      <td colspan="2"><strong>Byte 4</strong></td>
      <td><strong>Bytes [5-variable]</strong></td>
    </tr>
    <tr>
      <td><strong>Basic header (Type =1)</strong></td>
      <td colspan="2">Notification header</td>
      <td>Data</td>
    </tr>
    <tr>
      <td></td>
      <td>b7-4</td>
      <td>b3-0</td>
      <td></td>
    </tr>
    <tr>
      <td></td>
      <td>Class</td>
      <td>Type</td>
      <td></td>
    </tr>
  </tbody>
</table>


***Notification header***
-   Class: Class of notification
-   Type: Type of notification

The classes and types are presented below


**Class 0. System**

| **Type** | **Name**     | **Purpose**             | **Data**                                             |
|----------|--------------|------------------------|-------------------------------------------------------|
| 0        | Status       | System status          | Versions, temperature, reset cause (in case of crash) |
| 1        | Low-battery  | Low battery detected   | Consumption + battery voltage                         |
| 2        | BLE          | BLE securely connected | Securely connected/disconnected                       |
| 3        | Tamper       | Tamper detection       | Casing open/closed                                    |
| 4        | Heartbeat    | Heartbeat message      | Temperature, last reset cause and configuration CRC   |

**Class 1. SOS**

| **Type** | **Name**  | **Purpose**        | **Data** |
|----------|-----------|--------------------|-----------|
| 0        | SOS-on    | SOS activated      | None      |
| 1        | SOS-off   | SOS deactivated    | None      |

**Class 2. Temperature**

| **Type** | **Name**       | **Purpose**                      | **Data**     |
|----------|----------------|----------------------------------|--------------|
| 0        | Temp_high      | Critically high temperature reached | Temperature |
| 1        | Temp_low       | Critically low temperature reached  | Temperature |
| 2        | Temp_normal    | Temperature back to normal       | Temperature |

**Class 3. Accelerometer**

| **Type** | **Name**       | **Purpose**             | **Data**                                     |
|----------|----------------|------------------------|----------------------------------------------|
| 0        | Motion_start    | Motion start detected  | None                                         |
| 1        | Motion_end      | Motion end detected    | Acceleration vector + motion percent        |
| 2        | Shock          | Shock detected         | Acceleration vector + GADD index + nb shock  |

**Class 4. Network**

| **Type** | **Name**      | **Purpose**                  | **Data**     |
|----------|---------------|------------------------------|--------------|
| 0        | Main_up       | Main network is up.          | Network data |
| 1        | Backup_up     | Main network down. Backup is up. | Network data |

**Class 5. Geozoning**

| **Type** | **Name**         | **Purpose**                      | **Data**                 |
|----------|------------------|----------------------------------|--------------------------|
| 0        | Entry            | Entry beacon detected           | Beacon ID or MAC address |
| 1        | Exit             | Exit beacon detected            | Beacon ID or MAC address |
| 2        | In_hazard        | Entry in a hazardous area detected | Beacon ID or MAC address |
| 3        | Out_hazard       | Exit from a hazardous area detected | Beacon ID or MAC address |
| 4        | Meeting_point    | Meeting point detected          | Beacon ID or MAC address |


### System status notification

The status is transmitted with a common section and a page section.
Pages are used to publish information that does not require frequent
updates, using a round robin method. Each time a status notification is
sent, the page number increments until the last page is reached. Once
the last page is sent, the page identifier resets to 0.

*Common part*

<table>
  <tbody>
    <tr>
      <td><strong>1 byte</strong></td>
      <td colspan="2"><strong>1 byte</strong></td>
    </tr>
    <tr>
      <td>Current temperature</td>
      <td colspan="2">Reset cause and page ID</td>
    </tr>
    <tr>
      <td>b7- 0</td>
      <td>b7-3</td>
      <td>b2-0</td>
    </tr>
    <tr>
      <td>[-126 .. +127]</td>
      <td>Reset cause</td>
      <td>Page ID</td>
    </tr>
  </tbody>
</table>

Note

-   **Current temperature**. Current temperature. Signed integer (2's
    complement) expressed in degree Celsius.

-   **Reset cause**:
    -   AOS_ERROR_NONE (0) : No error.
    -   AOS_ERROR_HW_NMI (1): Hardware non-maskable interrupt fault.
    -   AOS_ERROR_HW_FAULT (2): Hardware fault.
    -   AOS_ERROR_HW_MPU (3): Hardware MPU fault.
    -   AOS_ERROR_HW_BUS (4): Hardware bus fault.
    -   AOS_ERROR_HW_USAGE (5): Hardware usage fault.
    -   AOS_ERROR_HW_IRQ (6): Unexpected interruption.
    -   AOS_ERROR_HW_WDOG (7): Watchdog
    -   AOS_ERROR_HW_BOR(8): Brown out reset
    -   AOS_ERROR_SW_ST_HAL_ERROR(9): ST HAL error.
    -   AOS_ERROR_SW_FREERTOS_ASSERT (10): FreeRTOS assertion.
    -   AOS_ERROR_SW_FREERTOS_TASK_OVF (11):FreeRTOS Task stack
        overflow.
    -   AOS_ERROR_SW_BLE_ASSERT(12). BLE core assertion
    -   AOS_ERROR_SW_RTC_FAIL (13): Real Time Clock peripheral fails to
        start.
    -   AOS_ERROR_SW_LORA_FAIL (14): LoRa unrecoverable failure
    -   AOS_ERROR_SW_DEBUG (15): Used to debug
    -   AOS_ERROR_SW_APP_START (16): Application assertions.

-   Page Id
    -   Max page ID = 1 for LoRaWAN only trackers (2 pages).
    -   Max page ID= 3 for Cellular Combo tracker (4 pages).

*Page 0. General status*

<table>
  <tbody>
    <tr>
      <td colspan="3"><strong>3 bytes</strong></td>
      <td colspan="4"><strong>4 bytes</strong></td>
      <td colspan="3"><strong>3 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="3">AT3 version</td>
      <td colspan="4">Configuration version</td>
      <td colspan="3">LR-HW version</td>
      <td colspan="2">HW batch ID</td>
    </tr>
    <tr>
      <td>b23-16</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b31-24</td>
      <td>b23-16</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b23-16</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>M</td>
      <td>m</td>
      <td>i</td>
      <td>M</td>
      <td>m</td>
      <td>i</td>
      <td>u</td>
      <td>HW</td>
      <td>type</td>
      <td>FW</td>
      <td>MSB</td>
      <td>LSB</td>
    </tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>1 byte</strong></td>
      <td><strong>1 byte</strong></td>
      <td><strong>1 byte</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="2">HW BOM ID</td>
      <td>
        Max <br />temperature
      </td>
      <td>Min <br />temperature</td>
      <td>Motion %</td>
      <td colspan="2">
        Battery <br />voltage (mV)
      </td>
      <td colspan="2">
        Total <br />consumption (mAh)
      </td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b7-0</td>
      <td>b7-0</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>[-126 .. +127]</td>
      <td>[-126 .. +127]</td>
      <td>[0..100]</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
    </tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="2">
        Cellular <br />consumption (mAh)
      </td>
      <td colspan="2">
        GNSS <br />consumption (mAh)
      </td>
      <td colspan="2">
        WIFI <br />consumption (mAh)
      </td>
      <td colspan="2">
        LR GNSS <br />consumption (mAh)
      </td>
      <td colspan="2">
        BLE <br />consumption (mAh)
      </td>
      <td colspan="2">
        MCU <br />consumption (mAh)
      </td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
    </tr>
  </tbody>
</table>

<table>
    <tr>
      <td colspan="4"><strong>4 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="4"><strong>Config CRC</strong></td>
    </tr>
    <tr>
      <td>b31-24</td>
      <td>b23-16</td>
      <td>b15-8</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td></td>
      <td></td>
      <td>LSB</td>
    </tr>
</table>


**Notes**
-   **M**: AT3 major version (for firmware version and configuration
    version)
-   **m:** AT3 minor version (for firmware version and configuration
    version)
-   **i** : AT3 iteration (for firmware version and configuration
    version)
-   **u**: AT3 configuration user byte
-   **HW:** Hardware version
-   **Type:** Type of hardware
-   **FW:** Firmware version
-   **Max temperature**. Max temperature since the beginning of the
    product life. Signed integer (2's complement) expressed in degree
    Celsius.
-   **Min temperature.** Min temperature since the beginning of the
    product life. Signed integer (2's complement) expressed in degree
    Celsius.
-   **Battery voltage:** Current battery voltage **(**mV)
-   **Consumption fields**. All consumption fields are in mAh

*Page 1. Almanac status*

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>4 bytes</strong></td>
      <td><strong>1 byte</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>5 byte</strong></td>
      <td><strong>1 byte</strong></td>
    </tr>
    <tr>
      <td colspan="2">
        LR1110<br />
        GPS<br />
        date
      </td>
      <td>
        LR1110<br />
        GPS<br />
        outdated /
      </td>
      <td>
        LR1110<br />
        GPS<br />
        good
      </td>
      <td colspan="2">
        LR1110<br />
        BEIDOU<br />
        date
      </td>
      <td>
        LR1110 BEIDOU<br />
        outdated
      </td>
      <td>
        LR1110 BEIDOU<br />
        good
      </td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b31-0</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b39-0</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>Bit field</td>
      <td>[0..31]</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>Bit field</td>
      <td>[0-37]</td>
    </tr>
  </tbody>
</table>

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="2">
        GNSS<br />
        GPS<br />
        date
      </td>
      <td colspan="2">
        GNSS<br />
        GPS<br />
        outdated
      </td>
      <td colspan="2">
        GNSS<br />
        BEIDOU<br />
        date
      </td>
      <td colspan="2">
        GNSS<br />
        BEIDOU<br />
        outdated
      </td>
      <td colspan="2">
        GNSS BEIDOU<br />
        good
      </td>
      <td colspan="2">
        GNSS BEIDOU<br />
        good
      </td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
    </tr>
  </tbody>
</table>


**Notes**

-   **LR1110/GNSS GPS almanac date**. Highest date ( GPS week number)
    over all GPS almanac entries.
-   **LR1110/GNSS GPS outdated**. Bitmap of outdated entries in the GPS
    almanac.
-   **LR1110/GNSS GPS good**. Number of entries matching the highest
    date.
-   **LR1110/GNSS BEIDOU almanac date**. Highest date ( GPS week number)
    over all BEIDOU almanac entries.
-   **LR1110/GNSS BEIDOU outdated**. Bitmap of outdated entries in the
    BEIDOU almanac.
-   **LR1110/GNSS BEIDOU good**. Number of entries having the highest
    date.

Each bit i of the bitmap represents satellite i (1 \<\< i).

*Page 2. Cellular part I*

<table>
  <tbody>
    <tr>
      <td colspan="5"><strong>6 bytes</strong></td>
      <td><strong>21 bytes</strong></td>
      <td><strong>16 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="5">FW version</td>
      <td>ICCID</td>
      <td>IMSI</td>
    </tr>
    <tr>
      <td>b47-40</td>
      <td>b39-32</td>
      <td>b31-24</td>
      <td>b23-16</td>
      <td>b15-0</td>
      <td>Ascii</td>
      <td>Ascii</td>
    </tr>
    <tr>
      <td>branch</td>
      <td>mode</td>
      <td>image</td>
      <td>delivery</td>
      <td>release</td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
</table>


Note that the ICCID and IMSI are available only if a cellular connection
has been established. Otherwise, these values are set to 0.

*Page 2. Cellular part II*

|  **33 bytes** | **16 bytes** |
| ------------- | ------------ |
| EUICCID       | IMEISV       |
| Ascii         | Ascii        |

**Notes**

-   The EUICCID is available only if a cellular connection using the
    eSIM has been established. Otherwise, this value is set to 0 (33
    null bytes).
-   The IMEISV is not yet supported. It is set to a null value (16 NULL
    bytes).

***Low battery***

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="2">Consumption</td>
      <td colspan="2">Battery voltage</td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
    </tr>
  </tbody>
</table>

**Notes**
-   Consumption is in mAh
-   Battery voltage is in mV

***BLE***

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>1 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="2">State</td>
    </tr>
    <tr>
      <td>b7-1</td>
      <td>b0</td>
    </tr>
    <tr>
      <td>RFU</td>
      <td>state</td>
    </tr>
  </tbody>
</table>


**Notes**
-   State: 0: Disconnected, 1: Connected
-   RFU: Reserved for future use

***Tamper***

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>1 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="2">State</td>
    </tr>
    <tr>
      <td>b7-1</td>
      <td>b0</td>
    </tr>
    <tr>
      <td>RFU</td>
      <td>state</td>
    </tr>
  </tbody>
</table>


**Notes**
-   State: 0: Casing closed, 1: Casing open
-   RFU: Reserved for future use

### Class SOS

No data. The SOS status is in the basic header.

### Class temperature

***Critical temperature high/low/normal***

The 3 types of notification are : Critically high temperature /
Critically low temperature / Return to normal temperature range

Each of these notifications includes the temperature which triggered the
notification.

| **1 byte**     |
| -------------- |
| Temperature    |
| b7-0           |
| [-126 .. +127] |

The temperature is signed (2's complement coding) and is in degrees Celsius.


### Class accelerometer

The data part of this notification class depends on the type.

***Motion start***

No data

***Motion end***

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>1 byte</strong></td>
    </tr>
    <tr>
      <td colspan="2">Acceleration X</td>
      <td colspan="2">Acceleration Y</td>
      <td colspan="2">Acceleration Z</td>
      <td>Motion %</td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>[0..100]</td>
    </tr>
  </tbody>
</table>

The 3 axis measurement of gravity after the device has stopped allows to
infer the angular position of the device. They are expressed as mg
signed values (2's complement coding)

***Shock***

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>1 byte</strong></td>
      <td><strong>1 byte</strong></td>
    </tr>
    <tr>
      <td colspan="2">Acceleration X</td>
      <td colspan="2">Acceleration Y</td>
      <td colspan="2">Acceleration Z</td>
      <td>GADD index</td>
      <td>Nb shocks</td>
    </tr>
    <tr>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b15-8</td>
      <td>b7-0</td>
      <td>b7-0</td>
      <td>b7-0</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>[0..100]</td>
      <td>[1-255]</td>
    </tr>
  </tbody>
</table>


The 3 axis measurement of maximum shock accelerations are expressed in
mg signed values (2's complement coding), allowing to infer the
direction of the shock.

Body damage is more accurately represented by the Gadd index, which
integrates acceleration intensity over total shock duration.



### Class network 

The data part of this class of notifications does not depend on the type
and is the following:

| **1 byte**     | **1 byte**   | **1 byte**     |
| -------------- | ------------ | -------------- |
| Active network | Main network | backup network |
| b7-0           | b7-0         | b7-0           |
| [0..2]         | [0..2]       | [0..2]         |

Each byte encodes a network technology:
-   0: No network
-   1: LoRaWAN network
-   2: Cellular network in low power mode
-   3: Cellular network in high power mode

### Class geozoning

Not yet supported

## Positions

The position messages can be sent in either single-frame mode or
multi-frames mode.

### Position header

The basic position header is defined as follows:

Single frame mode

| **Bytes [0-3]**             | **Byte 4**      | **Bytes [7-variable]** |
| --------------------------- | --------------- | ---------------------- |
| Basic header (**Type = 2**) | Position header | Data                   |


Multi-frame mode

| **Bytes [0-4]**                | **Byte 5**      | **Bytes [8-variable]** |
| ------------------------------ | --------------- | ---------------------- |
| Extended header (**Type = 2**) | Position header | Data                   |

The position header is defined as follows:

<table>
  <tbody>
    <tr>
      <td colspan="6"><strong>Position header 4 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="3">Information</td>
      <td colspan="2">Extended info</td>
      <td>Triggers (2 bytes)</td>
    </tr>
    <tr>
      <td>b7</td>
      <td>b6-5</td>
      <td>b4-0</td>
      <td>b7-4</td>
      <td>b3-0</td>
      <td>b15-b0</td>
    </tr>
    <tr>
      <td>M</td>
      <td>Status</td>
      <td>Position type</td>
      <td>RFU</td>
      <td>M-cnt</td>
      <td>Trigger bit-map</td>
    </tr>
  </tbody>
</table>

***Position header***

**Information**

-   b7: **M**. Motion bit. Set if a motion event has been detected since
    the transmission of the previous position payload.
-   b6-5: **Status**. Status of the position
    -   0 -- Success. Data contains the position.
    -   1 -- Timeout. Max time allowed to acquire the position. Optional
        data.
    -   2 -- Failure. Position acquisition failed for other reasons.
        Data contains failure reason or no data.
    -   3 -- Not-solvable: The acquisition has been done but is not
        solvable (WIFI or BLE). Optional data.
-   b4-0: **Position type**
    -   0 -- LR1110 GNSS formatted Nav1
    -   1 -- LR1110 GNSS Semtech Nav1
    -   2 -- LR1110 GNSS Semtech Nav 2
    -   3 -- WIFI
    -   4 - BLE scan1 (report mode: MAC-address)
    -   5 -- BLE scan1 (report mode: Short IDs)
    -   6 -- BLE scan1 (report mode Long IDs)
    -   7 - BLE scan2 (report mode: MAC-address)
    -   8 -- BLE scan2 (report mode: Short IDs)
    -   9 -- BLE scan2 (report mode Long IDs)
    -   10 - MT3333 GNSS fix
    -   11 -- MT3333 LP-GNSS

**Extended info**
-   b7-4: RFU (Reserved For Future Use)
-   b3-0: M-cnt. 4-bit motion counter. Increments if a motion event has
    been detected since the transmission of the previous position
    payload. The counter rolls over once the max value is reached.

**Note**:

This 4-bit motion counter allows the geolocation back-end application 
to detect whether there has been motion between 2 successive          
geolocation uplinks by comparing the value of the motion counter with 
its previously received value. This works even if we have lost up to  
14 consecutive in-motion uplinks, and any number of static uplinks.   
This enables the static position averaging filters to reset properly  
if the location of the tracker has changed.                           
                                                                      
![](./images/media/image26.png)                                       
                                                                      
In order to work properly, a reliable deduplication algorithm should  
be implemented in order to avoid comparing the counter value with the 
same value from a packet transmitted multiple times (custom           
retransmit policy). In AT3, this can be based on the value of the     
basic header 2-byte timestamp field.                                  


**Trigger**

Bit-field providing the geolocation triggers that were active for this
position. Refer to the [geolocation manager](./geoloc-manager) section for the bit meaning.


### LR1110 GNSS Formatted Nav1

This position message can carry up to 10 satellite information. The
multi-frame format can be used. In this case each frame carries a single
scan.

<table>
  <tbody>
    <tr>
      <td><strong>2 bytes</strong></td>
      <td colspan="5"><strong>4 bytes</strong></td>
      <td><strong>4 bytes</strong></td>
    </tr>
    <tr>
      <td>Time</td>
      <td colspan="5">Sat 1 info</td>
      <td>Sat 2 info</td>
    </tr>
    <tr>
      <td>-</td>
      <td>b31-30</td>
      <td>b29-24</td>
      <td>b23-22</td>
      <td>b21-19</td>
      <td>b18-0</td>
      <td>Same as sat 1</td>
    </tr>
    <tr>
      <td>-</td>
      <td>C</td>
      <td>ID</td>
      <td>CN</td>
      <td>000</td>
      <td>PRN</td>
      <td>Same</td>
    </tr>
  </tbody>
</table>


**Time** : LR1110 SW Time in step of 16 seconds.

**Sat x info**

-   b31-30: **C**. Constellation:
    -   0 -- GPS
    -   1 -- BEIDOU
    -   2, 3 - Spare
-   b29-24: **ID**. Satellite identifier starting at 0 regardless the
    constellation type.
-   b23-22: **CN**. Carrier to noise information
    -   0 -- C/N greater than 45 dB
    -   1 -- C/N in range \[41.. 45\] dB
    -   2 - C/N in range \[37..41\] dB
    -   3 - C/N less than 37 dB
-   b21-19: Unused. Set to 0
-   b18-0: **PRN**. Pseudo range value

To fit the LoRaWAN maximum payload size in the worst condition, the
number of satellites info should be limited to 10.


### LR1110 GNSS Semtech Nav1

The data part is the actual data payload received from the LR1110. It is
encoded and only Semtech (or licensed users like Abeeway) can decode it.
It should be forwarded as-is to the Semtech cloud.

Note that the number of sniffed satellites should be set appropriately
to allow LoRaWAN transmission with low data rate (DR0 -- DR2 for
Europe).

The multi-frame format can be used. In this case each frame carries a
single scan.

### LR1110 GNSS Semtech Nav2

The data part is the actual data payload received from the LR1110. It is
encoded and only Semtech (or licensed users like Abeeway) can decode it.
It should be forwarded as-is to the Semtech cloud.

The multi-frame format can be used. In this case each frame carries a
single scan.

### WIFI

This uplink message can carry up to 6 BSSIDs per frame. To carry more
BSSIDs, the multi-frame will be used if the payload size requires it.

Payload format

<table>
  <tbody>
    <tr>
      <td colspan="7"><strong>7 bytes</strong></td>
      <td><strong>7 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="7">BSSID 1 info</td>
      <td>BSSID 2 info</td>
    </tr>
    <tr>
      <td colspan="6">MAC address (6 bytes)</td>
      <td>1 byte</td>
      <td>Same as BSSID 1</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>LSB</td>
      <td>RSSI</td>
      <td>Same</td>
    </tr>
  </tbody>
</table>

**Note**

The RSSI is a negative value (2's complement) carrying the Received
Signal Strength Information (in dB).

To fit the LoRa maximum payload size in the worst condition, the number
of BSSI per frame is limited to 6. Above this value, the multi-frame is
used.


### BLE scan. MAC address

This uplink message can carry up to 6 beacon information per frame. To
carry more beacons, the multi-frame can be used.

Payload format

<table>
  <tbody>
    <tr>
      <td colspan="7"><strong>7 bytes</strong></td>
      <td><strong>7 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="7">Beacon 1 info</td>
      <td>Beacon 2 info</td>
    </tr>
    <tr>
      <td colspan="6">Identifier (6 bytes)</td>
      <td>1 byte</td>
      <td>Same as Beacon 1</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>LSB</td>
      <td>RSSI</td>
      <td>Same</td>
    </tr>
  </tbody>
</table>

**Notes**

-   The identifier is the MAC address if the report type is MAC address,
    otherwise it is 6 bytes extracted as the beacon identifier.
-   The RSSI is a negative value (2's complement) carrying the Received
    Signal Strength Information (in dB).
-   To fit the LoRaWAN maximum payload size in the worst condition, the
    number of Beacon info per frame is limited to 6. Above this value,
    the multi-frame is used.


### BLE scan. Short ID

This uplink message can carry up to 14 beacon information fields per
frame. To carry more beacons, the multi-frame can be used.

Payload format

<table>
  <tbody>
    <tr>
      <td colspan="3"><strong>3 bytes</strong></td>
      <td><strong>3 bytes</strong></td>
      <td><strong>3 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="3">Beacon 1 info</td>
      <td>Beacon 2 info</td>
      <td>Beacon 3 info</td>
    </tr>
    <tr>
      <td colspan="2">Beacon ID (2 bytes)</td>
      <td>1 byte</td>
      <td>Same as beacon 1</td>
      <td>Same as beacon 1</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>LSB</td>
      <td>RSSI</td>
      <td>Same as beacon 1</td>
      <td>Same as beacon 1</td>
    </tr>
  </tbody>
</table>


**Note**

The RSSI is a negative value (2's complement) carrying the Received
Signal Strength Information (in dB).

To fit the LoRaWAN maximum payload size in the worst conditions, the
number of Beacon info per frame is limited to 14. Above this value, the
multi-frame is used.

### BLE scan. Long ID 

This uplink message can carry up to 2 beacon information fields per
frame. To carry more beacons, the multi-frame format can be used.

Payload format

<table>
  <tbody>
    <tr>
      <td colspan="7"><strong>17 bytes</strong></td>
      <td><strong>17 bytes</strong></td>
    </tr>
    <tr>
      <td colspan="7">Beacon 1 info</td>
      <td>Beacon 2 info</td>
    </tr>
    <tr>
      <td colspan="6">Beacon ID (16 bytes)</td>
      <td>1 byte</td>
      <td>Same as Beacon 1</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td>LSB</td>
      <td>RSSI</td>
      <td>Same</td>
    </tr>
  </tbody>
</table>


**Note**

The RSSI is a negative value (2's complement) carrying the Received
Signal Strength Information (in dB).

To fit the LoRaWAN maximum payload size in the worst condition, the
number of Beacon info per frame is limited to 2. Above this value, the
multi-frame is used.


### MT3333 GNSS fix

This uplink message carries a GNSS fix or the GNSS satellites tracking
if the fix failed.

***Payload format in case of success***

<table>
  <tbody>
    <tr>
      <td colspan="4"><strong>4 bytes</strong></td>
      <td colspan="4"><strong>4 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>1 byte</strong></td>
      <td><strong>1 byte</strong></td>
    </tr>
    <tr>
      <td colspan="4">Latitude</td>
      <td colspan="4">Longitude</td>
      <td colspan="2">Altitude</td>
      <td colspan="2">COG</td>
      <td colspan="2">SOG</td>
      <td>EHPE</td>
      <td>Quality</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td></td>
      <td></td>
      <td>LSB</td>
      <td>MSB</td>
      <td></td>
      <td></td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td>-</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

**Notes**

-   The latitude the longitude are signed value (2's complement) and
    expressed with a unit of 10^-7^ degree.
-   The altitude is signed and expressed in meters.
-   COG: Course Over Ground expressed in 1/100 of degrees
-   SOG: Speed Over Ground expressed cm/second
-   EHPE is encoded as follows:

| **Coded value** | **EHPE in meters** |
| --------------- | ------------------ |
| 0 – 250         | 0 – 250 meters     |
| 251             | 250 < EHPE < 500   |
| 252             | 500 < EHPE < 1000  |
| 253             | 1000 < EHPE < 2000 |
| 254             | 2000 < EHPE < 4000 |
| 255             | EHPE > 4000        |

-   Quality: Fix quality coded as follow:
    -   Bits b7-5: Quality:
        -   0 -- invalid: The GNSS gave a fix but consider it as invalid
        -   1 -- valid: The GNSS gave a fix but has no idea if it is a
            2D or 3D
        -   2 -- fix 2D: Fix valid for 2 dimension (latitude and
            longitude valid).
        -   3 -- fix 3D Fix valid for 3 dimension (latitude, longitude
            and altitude valid).
    -   Bits b4-0: Number of satellites used for the fix. Max 12

***Payload format in case of failure or timeout***

<table>
  <tbody>
    <tr>
      <td><strong>1 byte</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td colspan="2"><strong>2 bytes</strong></td>
      <td><strong>...</strong></td>
    </tr>
    <tr>
      <td>Status</td>
      <td colspan="2">Sat 0</td>
      <td colspan="2">Sat 1</td>
      <td>...</td>
    </tr>
    <tr>
      <td>-</td>
      <td>svId</td>
      <td>Info</td>
      <td>svId</td>
      <td>Info</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

**Notes**

-   The Status field is coded as follow:

    -   b7 -- b5: Cause

        -   0: T0 timeout

        -   1: T1 timeout

        -   2: acquisition timeout

    -   b4 -- b0: Number of satellites seen.

-   The info field is coded on 1 byte and is formatted as follow:

    -   b7-b6: Constellation

        -   0: GPS

        -   1: GLONASS

        -   2: BEIDOU

        -   3: GALILEO

    -   b5-0: C/N0 in dBm

###  MT3333 LP-GNSS

This position message can carry up to 9 satellites information fields.
The multi-frame format can be used. In this case each frame carries a
single scan.

<table>
  <tbody>
    <tr>
      <td><strong>4 bytes</strong></td>
      <td colspan="4"><strong>4 bytes</strong></td>
      <td><strong>4 bytes</strong></td>
    </tr>
    <tr>
      <td>Time</td>
      <td colspan="4">Sat 1 info</td>
      <td>Sat 2 info</td>
    </tr>
    <tr>
      <td>-</td>
      <td>b31-30</td>
      <td>b29-24</td>
      <td>b23-22</td>
      <td>b21-0</td>
      <td>Same as sat 1</td>
    </tr>
    <tr>
      <td>-</td>
      <td>C</td>
      <td>ID</td>
      <td>CN</td>
      <td>PRN</td>
      <td>Same</td>
    </tr>
  </tbody>
</table>

**Time** : MT333 SW Time (TOW) in microseconds. It is sent MSB first
(big endian).

| **Bits**        | 31 - 20                | 19 - 0          |
| --------------- | ---------------------- | --------------- |
| **Description** | Nb seconds in the hour | Nb microseconds |

**Sat x info. Coded the same way than LR1110 NAV1 (with bit 21-19
used).**

-   b31-30: **C**. Constellation:
    -   0 -- GPS
    -   1 -- BEIDOU
    -   2, 3 - Spare
-   b29-24: **ID**. Satellite identifier starting at 0 regardless the
    constellation type.
-   b23-22: **CN**. Carrier to noise information
    -   3 -- C/N greater than 34 dB
    -   2 -- C/N in range \[28.. 33\] dB
    -   1 - C/N in range \[22..27\] dB
    -   0 - C/N less than 21 dB

-   b21-0: PRN. Pseudo range value. Coded for a full scale of 1ms
    shifted by 2 to the right.

## Query

These messages expect a response. They are always sent in single-frame
mode.

The queries are formatted as follows.

| **Bytes [0-3]**             | **Byte 4**   | **Bytes [5-variable]** |
| --------------------------- | ------------ | ---------------------- |
| Basic header (**Type = 3**) | Query header | Data                   |

***Query header***

-   b7-b5: Spare bits
-   b4-0: **Query type**:
    -   0 -- Aiding-position. The aiding position is needed by the
        tracker. **No data**.
    -   1 -- Update system time. The system time update is needed. **No
        data**
    -   2 -- Update GPS almanac. GPS almanac entries need to be
        refreshed. Data contains the list of satellites for which the
        update is needed.
    -   3 -- Update BEIDOU almanac. BEIDOU almanac entries need to be
        refreshed. Data contains the list of satellites for which the
        update is needed.

**Note**

The tracker system time update could be done using the appropriate LoRa
MAC request. However, remind that the application messages should not be
based on the underlying transport protocol.

## Echo-request

This query is used to probe the cellular network. It is only used for the cellular network (For LoRaWAN, AT3 uses the LoRaWAN link-check requests).

| Data part       |
|-----------------|
| 1 byte          |
| Sequence number |

**Note**

The tracker increases the sequence number for each transmission. The repsonse should contain the same value than the transmitted one.
 

### Update GPS almanac

Several satellites may be requested at a time, The data part is a list
of satellite identifiers defined as follow:

| **1 Byte**       |  **1 Byte**     | **...** |
| ---------------- | --------------- | ------- |
| SV ID1 1 [0..31] | SV ID 2 [0..31] | ...     |

**Notes**
-   **SV ID** means Space Vehicle identifier. First satellite identifier
    is 0.
-   Due to the limited payload size on the LoRa network (EU868, DR0-2,
    Max: 59 bytes), only 3 entries can be updated in a downlink. So the
    number of almanac entries requested in a single request is limited
    to 3.

### Update BEIDOU almanac

Several satellites may be requested at a time, The data part is a list
of satellite identifiers defined as follow:

| **1 Byte**      |  **1 Byte**      | **...** |
| --------------- | ---------------- | ------- |
| SV ID1  [0..34] | SV ID 2  [0..34] | ...     |

**Note**

-   **SV ID** means Space Vehicle identifier. First satellite identifier
    is 0.
-   Due to the limited payload size on the LoRa network (EU868, DR0-2,
    Max: 59 bytes), only 3 entries can be updated in a downlink. So the
    number of almanac entries requested in a single request is limited
    to 3.

## Responses

These messages carry the responses to network requests. The multi-frames
format can be used to segment long responses.

Single frame mode

| **Bytes [0-3]**             | **Byte 4**      | **Bytes [5-variable]** |
| --------------------------- | --------------- | ---------------------- |
| Basic header (**Type = 4**) | Response header | Data                   |

Multi-frame mode

| **Bytes [0-4]**                | **Byte 5**      | **Bytes [6-variable]** |
| ------------------------------ | --------------- | ---------------------- |
| Extended header (**Type = 4**) | Response header | Data                   |

***Response header***

-   b7-b5: Spare bits
-   b4-0: **Response type**
    -   0 -- Response to a generic configuration set request.
    -   1 -- Response to a parameter class configuration set request.
    -   2 -- Response to a generic configuration get request.
    -   3 -- Response to a parameter class configuration get request.
    -   4 -- Response to a BLE connectivity status request.
    -   5 -- Response to a configuration CRC request
    -   6 -- Response to a sensor get request

### Response to a generic configuration set request.

The data part consists of up to 16 parameters can be acknowledged at a
time.

<table>
  <tbody>
    <tr>
      <td colspan="3"><strong>4 Bytes</strong></td>
      <td colspan="3"><strong>3 Bytes</strong></td>
      <td colspan="3"><strong>3 Bytes</strong></td>
      <td><strong>...</strong></td>
    </tr>
    <tr>
      <td>CRC</td>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>Status</td>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>Status</td>
      <td>...</td>
    </tr>
  </tbody>
</table>


**Notes**
-   **CRC**. The 4 lowest bytes of the global configuration CRC.
-   **C-ID**. Parameter class identifier
-   **L-ID:** Local parameter identifier
-   **Status**. Local status for the parameter.
    -   0 -- Success
    -   1 -- Not found
    -   2 -- Below lower bound. For string and byte-array, length below the
    minimum
    -   3 -- Above higher bound. For string and byte-array, length above the
    maximum
    -   4 -- Bad value. Value in acceptable range but not is not supported.
    -   5 - Type mismatch
    -   6 -- Operation error (operation failure)
    -   7 -- Read-only variable.



### Response to a parameter class configuration set request

The data part consists of up to 24 parameter status fields.

<table>
  <tbody>
    <tr>
      <td><strong>1 byte</strong></td>
      <td colspan="2"><strong>2 Bytes</strong></td>
      <td colspan="2"><strong>2 Bytes</strong></td>
      <td><strong>...</strong></td>
    </tr>
    <tr>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>Status</td>
      <td>L-ID</td>
      <td>Status</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

**Notes**
-   **C-ID**. Parameter class identifier
-   **L-ID**: Local parameter identifier
-   **Status**. Local status for the parameter.
    -   0 -- Success
    -   1 -- Not found
    -   2 -- Below lower bound. For string and byte-array, length below the
    minimum
    -   3 -- Above higher bound. For string and byte-array, length above the
    maximum
    -   4 -- Bad value. Value in acceptable range but not is not supported.
    -   5 - Type mismatch
    -   6 -- Operation error (operation failure)
    -   7 -- Read-only variable. 

### Response to a generic configuration get request

The data part consists of a list of parameters belonging to any classes.
The multi-frame format can be used. Note that for some parameters, the
size is variable. So it is advised to avoid requesting too many
parameters at a time.

Parameter entry description

<table>
  <tbody>
    <tr>
      <td colspan="4"><strong>Parameter entry</strong></td>
      <td><strong>&hellip;</strong></td>
    </tr>
    <tr>
      <td colspan="3">3 Bytes</td>
      <td>Variable</td>
      <td>...</td>
    </tr>
    <tr>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>S/T</td>
      <td>Data</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

**Notes**
-   **C-ID** Parameter class identifier
-   **L-ID:** Local parameter identifier
-   **S/T:** Parameter size and type
    -   Bit 7-3: Variable size
    -   Bit 2-0: type
        -   0 -- Deprecated.
        -   1 -- Integer 32 bits
        -   2 -- Floating point (4 bytes)
        -   3 -- ASCII string
        -   4 -- Byte array
        -   5 - Error
-   **Data**: Variable data part
    -   Deprecated. No data.
    -   Integer 32 bits. 4 bytes in big endian (MSB first)
    -   Floating point. Single precision, 4 bytes n big endian (MSB
        first)
    -   ASCII string. Max 31 characters. It does not include the NULL
        char.
    -   Byte array. Max 32 bytes. For 32 bytes, the parameter size will
        be 0.  

### Response to a parameter class configuration get request

The data part consists of a list of parameters belonging to any classes.
The multi-frame format can be used. Note that for some parameters, the
size is variable. So it is advised to avoid requesting too many
parameters at a time.

The data part starts with the parameter class identifier and is followed
by a list of parameter entries.

<table>
  <tbody>
    <tr>
      <td colspan="4"><strong>Parameter entry</strong></td>
      <td><strong>&hellip;</strong></td>
    </tr>
    <tr>
      <td colspan="3">3 Bytes</td>
      <td>Variable</td>
      <td>...</td>
    </tr>
    <tr>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>S/T</td>
      <td>Data</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

**Notes**
-   **C-ID**. Parameter class identifier
-   **L-ID:** Local parameter identifier
-   **S/T** Parameter size and type.
    -   Bit 7-3: Parameter size
    -   Bit 2-0: type
        -   0 -- Deprecated
        -   1 -- Integer 32 bits
        -   2 -- Floating point (4 bytes)
        -   3 -- ASCII string
        -   4 -- Byte array
        -   5 - Error
-   **Data**: Variable data part
    -   Deprecated. No data
    -   Integer 32 bits. 4 bytes in big endian (MSB first)
    -   Floating point. Single precision, 4 bytes n big endian (MSB
        first)
    -   ASCII string. Max 31 characters. It does not include the NULL
        chan.
    -   Byte array. Max 32 bytes. For 32 bytes, the parameter size will
        be 0.

### Response to a BLE connectivity status request

The data part consists of the BLE status.

| Status |
| 1 Byte |

The *status* can take one of the following values:

**Notes**
-   **0** -- Idle: No connectivity activity.
-   **1** -- Advertising.
-   **2** -- Connected: the devices is connected but not bonded.
-   **3** -- Bonded: the devices is connected and bonded.

### Response to a Configuration CRC request
The data part consists of a list of configuration CRC groups matching the request.

**If No groups defined in the request (bitmap null)**
The data part consists of the requested bitmap and global configuration CRC (all groups except the internal)

| 2 bytes	| 4 Bytes |
| Bitmap	| CRC |

**If groups have been defined in the request**
The data part consists of the requested bitmap, followed by group configuration CRCs truncated to the 3 lower bytes.

| 2 bytes | 3 bytes | 3 bytes | ... |
| Bitmap | CRC1 | CRC2 | ... |

The **bitmap** has the same format as in the request, i.e. sum of 2<sup>group_identifier</sup>. For example if groups 1, 3 and 7 are requested, the bitmap will be  2<sup>1</sup> + 2<sup>3</sup> + 2<sup>7</sup> = 138 = 0x8A

### Response to a Sensor get request
The data part is the list of the sensor values requested.

| Sensor ID 1	| Value for ID1 | Sensor ID 2	| Value for ID2 | ... |
| 1 byte	| variable | 1 byte	| variable | ... |

- **Sensor ID** is the sensor identifier:
    - 0 : Reserved, do not use.
    - 1 : Accelerometer

- **Values** serialization depends on the sensor:
    - Accelerometer: accelerations along each axis, as big endian signed integrers.

    | X axis (mg) | Y axis (mg) | Z axis (mg) |
    | 2 bytes | 2 bytes | 2 bytes |

### Response of a system status request 

The response data format looks is identical to the status notification
format, see section [System status
notification](#system-status-notification).

### Response to a get GPS almanac entry request

The multi-frame can be used to answer the GPS almanac entries. The data
part is as follows:

<table width="537">
<tbody>
<tr>
<td colspan="2" width="179">
<p><strong>Almanac entry 1</strong></p>
</td>
<td colspan="2" width="179">
<p><strong>Almanac entry 2</strong></p>
</td>
<td width="179">
<p><strong>...</strong></p>
</td>
</tr>
<tr>
<td width="68">
<p>&nbsp;2 bytes</p>
</td>
<td width="111">
<p>16 bytes</p>
</td>
<td width="89">
<p>2 bytes</p>
</td>
<td width="90">
<p>16 bytes</p>
</td>
<td width="179">
<p>&hellip;</p>
</td>
</tr>
<tr>
<td width="68">
<p>Date</p>
</td>
<td width="111">
<p>Data-entry 1</p>
</td>
<td width="89">
<p>Date</p>
</td>
<td width="90">
<p>Data-entry 2</p>
</td>
<td width="179">
<p>...</p>
</td>
</tr>
</tbody>
</table>

**Notes**

-   **Date**: Number of days since April 7<sup>th</sup> 2019.
-   **Data-entry** is formatted as follow:

<table width="444">
<tbody>
<tr>
<td colspan="2" width="444">
<p><strong>Almanac Entry</strong></p>
</td>
</tr>
<tr>
<td width="102">
<p>&nbsp;1 byte</p>
</td>
<td width="342">
<p>15 bytes</p>
</td>
</tr>
<tr>
<td width="102">
<p>SV ID</p>
</td>
<td width="342">
<p>Almanac data</p>
</td>
</tr>
</tbody>
</table>

-   **SV-ID**: Satellite identifier in the GPS constellation. Starts at 0.

### Response of a get BEIDOU almanac entry request

Not yet implemented.

### Response to a set GPS almanac entry request

The multi-frame format can be used to provide the GPS almanac entries.
The data part is as follows:

<table width="537">
<tbody>
<tr>
<td colspan="2" width="179">
<p><strong>Almanac entry 1</strong></p>
</td>
<td colspan="2" width="179">
<p><strong>Almanac entry 2</strong></p>
</td>
<td width="179">
<p><strong>...</strong></p>
</td>
</tr>
<tr>
<td width="68">
<p>&nbsp;2 bytes</p>
</td>
<td width="111">
<p>16 bytes</p>
</td>
<td width="89">
<p>2 bytes</p>
</td>
<td width="90">
<p>16 bytes</p>
</td>
<td width="179">
<p>&hellip;</p>
</td>
</tr>
<tr>
<td width="68">
<p>Date</p>
</td>
<td width="111">
<p>Data-entry 1</p>
</td>
<td width="89">
<p>Date</p>
</td>
<td width="90">
<p>Data-entry 2</p>
</td>
<td width="179">
<p>...</p>
</td>
</tr>
</tbody>
</table>

**Notes**
-   **Date**: Number of days since April 7<sup>th</sup> 2019.
-   **Data-entry** is formatted as follow:

<table width="444">
<tbody>
<tr>
<td colspan="2" width="444">
<p><strong>Almanac Entry</strong></p>
</td>
</tr>
<tr>
<td width="102">
<p>&nbsp;1 byte</p>
</td>
<td width="342">
<p>15 bytes</p>
</td>
</tr>
<tr>
<td width="102">
<p>SV ID</p>
</td>
<td width="342">
<p>Almanac data</p>
</td>
</tr>
</tbody>
</table>

-   **SV-ID**: Satellite identifier in the GPS constellation. Start at
    0.
