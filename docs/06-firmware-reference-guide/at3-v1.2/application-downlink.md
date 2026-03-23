---
keywords: [ AT3, AT3_v1.2 ]
sidebar_position: 12
---

# Application downlink

This section defines the downlinks sent by the network. The network can
be either LoRaWAN or LTE.

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

The commands do not expect either responses or statuses from the
tracker. The proper receipt and execution of a command can be inferred
by analyzing the Ack token (ACK-TK) field of uplinks received after sending the
command.

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
    -   11 -- clear motion percentage (no data )

### Clear configuration in flash memory

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

### Set GPS almanac

This command is used to setup GPS almanac entries. The format of the
data part is the following

| **Common** | **Almanac entry 1** | **Almanac entry 2** | **...** |
| ---------- | ------------------- | ------------------- | ------- |
|  2 bytes   | 16 bytes            | 16 bytes            | …       |
| Date       | Data-entry 1        | Data-entry 2        | ...     |

**Notes**
-   **Date**: Number of days since April 7<up>th</up> 2019. Big endian.
-   **Data-entry** is formatted as follows:

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

-   **SV-ID**: Satellite identifier in the constellation. Starts at
    index 0.
-   It is up to the server to adapt the number of entries to send based
    on the network type (LoRaWAN or Cellular) and the data-rate used for
    the downlink if LoRaWAN is used. **However, the maximum size of 255
    (full downlink size including network encapsulation) must be
    respected.**


### Set BEIDOU almanac entry request

Not yet implemented.

### System event command

This command offer the possibility to trigger events, the possible
events are related to user class and core class.

The format of the data part is the following:

| **Class id** | **Event type** |
| ------------ | -------------- |
|  1 byte      | 1 byte         |

## Requests

Downlink requests expect a response from the tracker.

The format of a request is the following

| **Byte 0**                 | **Byte 1** | **Bytes [2-variable]** |
| -------------------------- | ---------- | ---------------------- |
| Basic header (**Type =2**) | Request    | Data                   |

**Note**
-   **Byte 0.** Basic header with type = 2.
-   **Byte 1**. Request types:
    -   0 -- Generic configuration set request.
    -   1 -- Parameter class configuration set request.
    -   2 -- Generic configuration get request.
    -   3 -- Parameter class configuration get request.
    -   4 -- BLE connectivity status request.
    -   5 -- CRC configuration request
    -   6 -- Get sensor values

### Generic configuration set request

This request is used to configure any parameter in the tracker. This
downlink should be used when multiple classes of parameters are affected
by the downlink.

The data part is a list of parameter entries as defined below. Note that
the format is the same than the **answer of generic configuration get
request** from the tracker.

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

**Notes**

-   **C-ID**. Parameter class identifier
-   **L-ID:** Local parameter identifier
-   **S/T:** Parameter size and type
    -   Bit 7-3: Variable size
    -   Bit 2-0: type
        -   0 -- Deprecated
        -   1 -- Integer 32 bits
        -   2 -- Floating point (4 bytes)
        -   3 -- ASCII string
        -   4 -- Byte array
-   **Data**: Variable data part
    -   Deprecated. No data.
    -   Integer 32 bits. 4 bytes in big endian (MSB first)
    -   Floating point. Single precision, 4 bytes n big endian (MSB
        first)
    -   ASCII string. Max 31 characters. It should exclude the NULL
        char.
    -   Byte array. Max 32 bytes. For 32 bytes, the parameter size will
        be 0.

This message is answered by the tracker with the **answer of generic
configuration set request.**

### Parameter class configuration set request

This request is used to configure a single parameter class in the
tracker. Multiple parameters belonging to this class can be modified.

The data part is a list of parameter entries as defined below. Note that
the format is the same than the **answer of a parameter class get
request** from the tracker.

**Notes**

-   **C-ID**. Parameter class identifier. This field appears only once
    per message.
-   **L-ID:** Local parameter identifier
-   **S/T** Parameter size and type.
    -   Bit 7-3: Parameter size
    -   Bit 2-0: type
        -   0 -- Deprecated
        -   1 -- Integer 32 bits
        -   2 -- Floating point (4 bytes)
        -   3 -- ASCII string
        -   4 -- Byte array
-   **Data**: Variable data part
    -   Deprecated. No data
    -   Integer 32 bits. 4 bytes in big endian (MSB first)
    -   Floating point. Single precision, 4 bytes n big endian (MSB
        first)ASCII string. Max 31 characters. It should exclude the
        NULL char
    -   Byte array. Max 32 bytes. For 32 bytes, the parameter size will
        be 0

This message is answered by the tracker with the **answer of a parameter
class set request.**


### Generic configuration get request

This request is used to query some configuration parameters from the
tracker. This downlink should be used when multiple classes of
parameters are affected by the downlink.

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


**Notes**
-   C-ID. Parameter class identifier
-   L-ID: Local parameter identifier

This message is answered by the tracker with the **answer of generic
configuration get request.**


### Parameter class configuration get request

This request is used to query configuration parameters belonging to a
same parameter

The data part is a list of parameter entries as defined below.

| **C-ID** | **L-ID** | **L-ID** | **...** |
|----------|----------|----------|---------|
| 1 Byte   | 1 Byte   | 1 Byte   |  ...    |

**Notes**

-   C-ID. Parameter class identifier. This field appears only once per
    message
-   L-ID: Local parameter identifier

This message is answered by the tracker with the **answer of a parameter
class get request.**


### BLE connectivity status request

This request is used to query the BLE connectivity status, There is no
data part for this request.

### Configuration CRC request

This request is used to query the CRC of the configuration. 

The data part is a bitmap of parameter groups for which we expect the CRC. If value 0 is provided, then the global configuration CRC is returned.

| **Group bitmap** |
|------------------|
|     2 bytes      |


**Notes**

The bitmap is formed as follow:  Sum of 2<up>group_identifier</up>.
Example: groups 1, 3 and 7 are requested. The bitmap will be  2<up>1</up> + 2<up>3</up> + 2<up>7</up> = 138 = 0x8A

This message is answered by the tracker with the **Response of a CRC configuration request** frame.

###	Get sensor value request

This generic request is used to read the sensor values. 
The data part is the list of sensor identifiers to be read.

| **Sensor ID 1** | **...*** | **Sensor ID n** |
|-----------------|----------|-----------------|
|     1 byte      |          |    1 byte       |

This message is answered by the tracker with the Sensor get Response.
- Sensor ID:
    - 0: Reserved for future use. Do not use.
    - 1: Accelerometer

## Responses

This section outlines the payload format of responses to the tracker queries.

The generic format of a response is the following

| **Byte 0**                 | **Byte 1**  | **Bytes [2-variable]** |
| -------------------------- | ----------- | ---------------------- |
| Basic header (**Type =3**) | Response type | Data                   |

**Note**
-   **Byte 0.** Basic header with type = 3.
-   **Byte 1**. The Response type matches the Request type:
    -   0 -- Aiding-position. The aiding position is needed by the
        tracker.
    -   1 -- Echo(reply. Used only for cellular.
    -   2 -- Update GPS almanac. GPS almanac entries need to be
        refreshed. Data contains the list of satellites for which the
        update is needed.
    -   3 -- Update BEIDOU almanac. BEIDOU almanac entries need to be
        refreshed. Data contains the list of satellites for which the
        update is needed.

### Aiding position

(Not yet available)

### Echo reply

This answer is the reply of an echo-request query from the tracker (only used over a cellular network).
The data part (sequence number) should be copied from the echo-request query.

| **Sequence number** |
|---------------------|
|     1 byte          |


### Update GPS almanac

This answer is used to setup GPS almanac entries. The format of the data
part is the following

| **Common** | **Almanac entry 1** | **Almanac entry 2** | **...** |
| ---------- | ------------------- | ------------------- | ------- |
|  2 bytes   | 16 bytes            | 16 bytes            | …       |
| Date       | Data-entry 1        | Data-entry 2        | ...     |

**Notes**

-   **Date**: Number of days since April 7<up>th</up> 2019 in big endian
    format.
-   **Data-entry** is formatted as follow:

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

-   **SV-ID**: Satellite identifier in the constellation. Start at 0.
-   Due to the limited payload size on the LoRaWAN network (EU868, DR0-2,
    Max: 59 bytes), only 3 entries can be updated in a downlink.

