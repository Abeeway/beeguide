---
keywords: [ AT3, AT3_v1.3 ]
sidebar_position: 36.3
---

# Application downlinks

This section defines the downlinks sent by the network. The network can
be either LoRaWAN or cellular (LTE-M, NB-IoT).

## Message header

The uplinks are composed by a common header followed by a data part. The
data part content depends on the downlink type.

### Basic header

The basic header has a single byte. The multi-frame mode is not
supported for downlink messages (since an uplink is needed to trigger
the downlink message in LoRaWAN class A).

**Basic header**

<table>
  <tbody>
    <tr>
      <td colspan="3"><strong>Byte 0</strong></td>
    </tr>
    <tr>
      <td>b7-6</td>
      <td>b5-3</td>
      <td>b2-0</td>
    </tr>
    <tr>
      <td>F</td>
      <td>Type</td>
      <td>ACK-TK</td>
    </tr>
  </tbody>
</table>

***Byte 0 description***

-   **RFU**. Reserved for future use.
-   **Type**. Frame type.:
    -   1 -- **Command**. Commands are neither acknowledged nor answered
        (Reset, BLE bootloader, SOS enter/leave, and so on).
    -   2 -- **Request**. Requests expect a response uplink.
    -   3 -- **Answer**. Answer a query from the tracker.
-   **ACK-TK**: Ack-token. Value (in \[0..7\]) extracted from the last
    downlink received. It is used to acknowledge the downlinks.

## Commands

:::caution
Keep in mind that wireless networks are inherently unreliable.  
The proper receipt and execution of a command can be verified by analyzing the **Ack Token (ACK-TK)** field of the uplinks received after sending the command.  
This value should match the ACK-TK configured in the command.  

It is recommended to allocate ACK-TKs in **round-robin mode**, ensuring that packet loss can be detected if the ACK-TK in uplinks is not updated.

As your server waits for the next uplink to confirm processing of the last request, allocate a **sufficiently long timer** (typically multiples of the period defined for the status page, as uplinks can also get lost). The ACK-TK is copied in all uplinks, so if you wait long enough you will always receive an uplink message. 

Implement **throttling**, so that a new command is sent **only after** the previous one has been confirmed (uplink ACK-TK matches the request’s ACK-TK) **or** after the request timeout.
:::

The format of a command is the following

| **Byte 0**                 | **Byte 1** | **Variable** |
| -------------------------- | ---------- | ------------ |
| Basic header (**Type =1**) | Command    | Data         |

**Note**

-   Byte 0. Basic header with type = 1
-   Byte 1. Command:
    -   0 -- Clear the configuration in flash memory and reset the tracker
    -   1 -- Reset the tracker (no data)
    -   2 -- Start SOS (no data)
    -   3 -- Stop SOS (no data)
    -   4 -- System status request (no data)
    -   5 -- Position-On-Demand (POD) (no data)
    -   6 -- Set GPS almanac
    -   7 -- Set BEIDOU almanac
    -   8 -- Start BLE connectivity (no data)
    -   9 -- Stop BLE connectivity (no data)
    -   10 -- System event
    -   11 -- Clear motion percentage (no data)
    -   12 -- Get buffered uplinks, filtered by date and type
    -   13 -- Clear the uplink buffer (no data)
    -   14 –- Clear BLE bond data (no data)

### `Clear flash memory configuration` command

This command may optionally include additional data.
If no data is provided, the configuration is reset to factory default values, excluding the internal group.
If data is provided, it must be a list of full parameter identifiers to retain their current values during the reset.
A maximum of 10 parameters can be preserved.

<table>
  <tr>
    <th colspan="2">Full ID 1</th>
    <th colspan="2">Full ID 2</th>
    <th colspan="2">...</th>
    <th colspan="2">Full ID 10</th>
  </tr>
  <tr>
    <th colspan="2">2 bytes</th>
    <th colspan="2">2 bytes</th>
    <th colspan="2">...</th>
    <th colspan="2">2 bytes</th>
  </tr>
  <tr>
    <th>Class ID</th><th>Local ID</th>
    <th>Class ID</th><th>Local ID</th>
    <th colspan="2">...</th>
    <th>Class ID</th><th>Local ID</th>
  </tr>
</table>

### `Set GPS almanac` command

This command is used to setup GPS almanac entries. The command paramters are formatted as follows:

| **Common** | **Almanac entry 1** | **Almanac entry 2** | **...** |
| ---------- | ------------------- | ------------------- | ------- |
|  2 bytes   | 16 bytes            | 16 bytes            | …       |
| Date       | Data-entry 1        | Data-entry 2        | ...     |

- **Date**: Number of days since April 7<up>th</up> 2019. Big endian.
- **Data-entry** is formatted as follows:
<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>Almanac Entry</strong></td>
    </tr>
    <tr>
      <td>1 byte</td>
      <td>15 bytes</td>
    </tr>
    <tr>
      <td>SV ID</td>
      <td>Almanac data</td>
    </tr>
  </tbody>
</table>

- **SV-ID**: Satellite identifier in the constellation. Starts at
    index 0.
- It is up to the server to adapt the number of entries to send based on the network type (LoRaWAN or Cellular) and the data-rate used for the downlink if LoRaWAN is used. **However, the maximum size of 255 (full downlink size including network encapsulation) must be respected.**

### `Set BEIDOU almanac` command

Not yet implemented.

### `System event` command

This command offer the possibility to trigger events, the possible
events are related to user class and core class.

The format of the data part is the following:

| **Class id** | **Event type** |
| ------------ | -------------- |
|  1 byte      | 1 byte         |

### `Get buffered uplinks` command

After the generic command header, the `Get buffered uplinks` command paramters are formatted as follows:

<table>
  <tbody>
    <tr>
      <td colspan="4"><strong>Begin date</strong></td>
      <td colspan="4"><strong>Duration</strong></td>
      <td colspan="4"><strong>Type mask</strong></td>
    </tr>
    <tr>
      <td colspan="4">4 bytes</td>
      <td colspan="4">2 bytes</td>
      <td colspan="4">1 byte</td>
    </tr>
    <tr>
      <td>MSB</td>
      <td>...</td>
      <td>...</td>
      <td>LSB</td>
      <td>MSB</td>
      <td>LSB</td>
      <td></td>
    </tr>
  </tbody>
</table>

Where:
- **Begin date**: UTC time in second (Unix time epoch: January 1st, 1970).
- **Duration**: Number of second from the begin date we want the data buffering.
- **Type mask**: Bit mask. Type of buffered data we want to extract:
  - Bit 0: Positions only are expected.
  - Bit 1: Notification are expected.
  - Bit 2: Telemetry data are expected.
  Example: type = 0x03: Positions and notifications are expected.

:::note
- A new `Get buffered uplinks` command clears the previous one even if it is not complete.
- On the server side, keep in mind that the completion of the request may take a log time over LoRaWAN networks due to the duty cycle constraints. The completion of the request is indicated though a notification of class 6.
:::

## Requests

Downlink requests expect a response from the tracker.

:::caution
Keep in mind that wireless networks are inherently unreliable.  
The proper receipt and execution of a command can be verified:
- by waiting for the command response (which can get lost)
- by analyzing the **Ack Token (ACK-TK)** field of any uplink received after sending the command. The value should match the ACK-TK configured in the command.

It is recommended to allocate ACK-TKs in **round-robin mode**, ensuring that packet loss can be detected if the ACK-TK in uplinks is not updated.

Implement **throttling**, so that a new command is sent **only after** the previous one has been confirmed (response received, or uplink ACK-TK matches the request’s ACK-TK).
:::

The format of a request is the following

| **Byte 0**                 | **Byte 1** | **Bytes [2-variable]** |
| -------------------------- | ---------- | ---------------------- |
| Basic header (**Type =2**) | Request    | Data                   |

- **Byte 0.** Basic header with type = 2.
- **Byte 1**. Request types:
  -   0 -- Generic configuration set request.
  -   1 -- Parameter class configuration set request.
  -   2 -- Generic configuration get request.
  -   3 -- Parameter class configuration get request.
  -   4 -- BLE connectivity status request.
  -   5 -- CRC configuration request
  -   6 -- Get sensor values
  -   7 -- Get debug information

### `Generic configuration set request`

This request is used to configure any parameter in the tracker, and multiple classes of parameters can be updated in a single command.
The command parameters are defined below. Note that the format is the same as the [`Generic configuration get response`](./application-uplink.md#generic-configuration-get-response).

<table>
  <tbody>
    <tr>
      <td colspan="4"><strong>Parameter entry 1</strong></td>
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

- **C-ID**. Parameter class identifier
- **L-ID:** Local parameter identifier
- **S/T:** Parameter size and type
  -   Bit 7-3: Variable size
  -   Bit 2-0: type
      -   0 -- Deprecated
      -   1 -- Integer 32 bits
      -   2 -- Floating point (4 bytes)
      -   3 -- ASCII string
       -   4 -- Byte array
- **Data**: Variable data part
  -   Deprecated. No data.
  -   Integer 32 bits. 4 bytes in big endian (MSB first)
  -   Floating point. Single precision, 4 bytes n big endian (MSB
      first)
  -   ASCII string. Max 31 characters. It should exclude the NULL
      char.
  -   Byte array. Max 32 bytes. For 32 bytes, the parameter size will
        be 0.

The tracker responds with a [`Generic configuration set response`](./application-uplink.md#generic-configuration-get-response).

### `Parameter class configuration set request`

This request is used to configure a single parameter class in the tracker. Multiple parameters belonging to this class can be modified, using their identifier within the class.

The data part is a list of parameters as defined below. Note that the format is the same as the [](./application-uplink.md#parameter-class-configuration-get-response).

<table>
  <tbody>
    <tr>
      <td> Class </td>
      <td colspan="3"><strong>Parameter entry 1</strong></td>
      <td colspan="3"><strong>Parameter entry 2</strong></td>
      <td><strong>...</strong></td>
    </tr>
    <tr>
      <td>1 byte</td>
      <td>1 byte</td>
      <td>1 byte</td>
      <td>Variable</td>
      <td>1 byte</td>
      <td>1 byte</td>
      <td>Variable</td>
      <td>...</td>
    </tr>
    <tr>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>S/T</td>
      <td>Data</td>
      <td>L-ID</td>
      <td>S/T</td>
      <td>Data</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

- **C-ID**. Parameter class identifier. This field appears only once per message.
- **L-ID:** Local parameter identifier
- **S/T** Parameter size and type.
  -   Bit 7-3: Parameter size
  -   Bit 2-0: type
    -   0 -- Deprecated
    -   1 -- Integer 32 bits
    -   2 -- Floating point (4 bytes)
    -   3 -- ASCII string
    -   4 -- Byte array
- **Data**: Variable data part
  -   Deprecated. No data
  -   Integer 32 bits. 4 bytes in big endian (MSB first)
  -   Floating point. Single precision, 4 bytes n big endian (MSB first)
  -   ASCII string. Max 31 characters. It should exclude the NULL char
  -   Byte array. Max 32 bytes. For 32 bytes, the parameter size will be 0

The tracker responds with a [`Parameter class configuration set response`](./application-uplink.md#parameter-class-configuration-set-response).

### `Generic configuration get request`

This request is used to query some configuration parameters from the tracker. This downlink should be used when multiple classes of parameters are affected by the downlink.

The data part is a list of parameter entries as defined below.

<table>
  <tbody>
    <tr>
      <td><strong>Common</strong></td>
      <td colspan="3"><strong>Parameter entry 1</strong></td>
      <td colspan="3"><strong>Parameter entry 2</strong></td>
      <td><strong>&hellip;</strong></td>
    </tr>
    <tr>
      <td>1 Byte</td>
      <td colspan="2">2 Bytes</td>
      <td>Variable</td>
      <td colspan="2">2 Bytes</td>
      <td>Variable</td>
      <td>...</td>
    </tr>
    <tr>
      <td>C-ID</td>
      <td>L-ID</td>
      <td>S/T</td>
      <td>Data</td>
      <td>L-ID</td>
      <td>S/T</td>
      <td>Data</td>
      <td>...</td>
    </tr>
  </tbody>
</table>

-   **C-ID**. Parameter class identifier
-   **L-ID**: Local parameter identifier

The tracker responds with a [`Generic configuration get response`](./application-uplink.md#generic-configuration-get-response).

### `Parameter class configuration get request`

This request is used to query configuration parameters belonging to a single parameter class.

The data part is a list of parameter IDs as defined below.

| **C-ID** | **L-ID** | **L-ID** | **...** |
|----------|----------|----------|---------|
| 1 Byte   | 1 Byte   | 1 Byte   |  ...    |


- **C-ID**. Parameter class identifier. This field appears only once per message
- **L-ID**: Local parameter identifier

The tracker responds with a [`Parameter class configuration get response`](./application-uplink.md#parameter-class-configuration-get-response).

### `BLE connectivity status request`

This request is used to query the BLE connectivity status, There is no
data part for this request.

The tracker responds with a [`BLE connectivity status response`](./application-uplink.md#ble-connectivity-status-response).

### `Configuration CRC request`

This request is used to query the CRC of selected configuration groups, or the global configuration CRC, for configuration auditing. 

The data part is a bitmap of parameter groups for which we expect the CRC. If value 0 is provided, then the global configuration CRC is returned.

| **Group bitmap** |
|------------------|
|     2 bytes      |

The **Group bitmap** is formed as follow:  Sum of 2<up>group_identifier</up>.
Example: groups 1, 3 and 7 are requested. The bitmap will be  2<up>1</up> + 2<up>3</up> + 2<up>7</up> = 138 = 0x8A

The tracker responds with a [`Configuration CRC response`](./application-uplink.md#configuration-crc-response).

###	`Get sensor value request`

This generic request is used to read sensor measurements. 
The data part is the list of sensor identifiers to be read.

| **Sensor ID 1** | **...*** | **Sensor ID n** |
|-----------------|----------|-----------------|
|     1 byte      |          |    1 byte       |

- **Sensor ID**:
  - 0: Reserved for future use. Do not use.
  - 1: Accelerometer

The tracker responds with a [`Get sensor value response`](./application-uplink.md#get-sensor-value-response).

### `Get information request`

This generic request is used by technical support to retrieve diagnostics.
| Type   |
|--------|
| 1 byte |

Where 
- **Type**: Specifies the type of information:
  - 0: get crash diagnostics

The tracker responds with a [`Get information response`](./application-uplink.md#get-information-response).

## Responses

This section outlines the payload format of responses to the [device queries](./application-uplink.md#device-queries).

The generic format of a response is the following

| **Byte 0**                 | **Byte 1**  | **Bytes [2-variable]** |
| -------------------------- | ----------- | ---------------------- |
| Basic header (**Type =3**) | Response type | Data                   |

- **Byte 0.** Basic header with type = 3.
- **Byte 1**. The Response type matches the Request type:
  - 0 -- Aiding-position. The aiding position is needed by the tracker.
  - 1 -- Echo reply. Used only for cellular.
  - 2 -- Update GPS almanac. GPS almanac entries need to be refreshed. Data contains the list of satellites for which the update is needed.
  - 3 -- Update BEIDOU almanac. BEIDOU almanac entries need to be refreshed. Data contains the list of satellites for which the update is needed.

### Aiding position

(Not yet available)

### Echo reply

This downlink replies to an [echo-request](./application-uplink.md#echo-request) query from the tracker (only used over a cellular network).
The data part (sequence number) should be copied from the echo-request query.

| **Sequence number** |
|---------------------|
|     1 byte          |

### Update GPS almanac

This downlink frame is used to setup GPS almanac entries. It can be used as an asynchronous command (a server can monitor the status of GNSS almanacs through status notifications), or as response to a [request](./application-uplink.md#update-gps-almanac) query initiated by the tracker.
The request paramters are formatted as follows:

| **Common** | **Almanac entry 1** | **Almanac entry 2** | **...** |
| ---------- | ------------------- | ------------------- | ------- |
|  2 bytes   | 16 bytes            | 16 bytes            | ...     |
| Date       | Data-entry 1        | Data-entry 2        | ...     |

- **Date**: Number of days since April 7<up>th</up> 2019 in big endian format.
- **Data-entry** is formatted as follow:

<table>
  <tbody>
    <tr>
      <td colspan="2"><strong>Almanac Entry</strong></td>
    </tr>
    <tr>
      <td>1 byte</td>
      <td>15 bytes</td>
    </tr>
    <tr>
      <td>SV ID</td>
      <td>Almanac data</td>
    </tr>
  </tbody>
</table>

- **SV-ID**: Satellite identifier in the constellation. Start at 0.

Due to the limited payload size on the LoRaWAN network (EU868, DR0-2, Max: 59 bytes), only 3 entries can be updated per downlink.