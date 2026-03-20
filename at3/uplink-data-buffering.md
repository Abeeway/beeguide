---
keywords: [ AT3, AT3_v1.4 ]
sidebar_position: 36.2
---

# Uplink Data Buffering

Uplink Data Buffering helps **reduce data loss when network coverage is unavailable or packets are lost**, by allowing the device to **replay uplink messages** that may have been missed by the target application server.

With this feature, the device temporarily stores selected uplink messages in its flash memory and resends them when requested by the server.

---

## Overview

- **Purpose:** Ensures important uplink data (such as positions, telemetry, or alerts) can be retrieved later if the network was unavailable when the data was first sent.  
- **How it works:**  
  - The device stores uplink messages in flash memory.  
  - After the device has experienced a disconnection and comes back online, the application server can easily detect a transmission loss by analyzing the gap in the uplink frame counters. The server can then use the [`get-buffered-uplinks` command](./application-downlink.md#get-buffered-uplinks-command) to retrieve the missing packets from the device within a specific time range.  
  - Only complete multi-frame messages are replayed to guarantee data consistency.
- **Filtering:** The feature can be configured to only store specific types of uplink data (e.g., positions, notifications, telemetry).  

---

## Storage Behavior

- Messages are stored in a dedicated flash memory partition, if they match the filter defined by parameter **`core_db_type_mask`**
- Each stored entry includes:  
  - Message type  
  - Timestamp  
  - Payload  
- The circular buffer accommodates **up to 1360 uplink frames**. The system ensures memory is used efficiently and automatically cycles through available storage.  
- Both single-frame and multi-frame uplinks are supported. Multi-frame messages are always stored and replayed as complete units.

---

## Replay Behavior

- The server can request uplink replay for a defined time window using the [`get-buffered-uplinks` command](./application-downlink.md#get-buffered-uplinks-command).  
- The device:  
  - Searches the buffer for all relevant uplinks in that time range.  
  - Ensures multi-frame messages are replayed completely (never partially).  
  - Skips incomplete multi-frames to maintain consistency.  
- Replay is delayed if the device’s transmission queue is full.  

:::note
The original uplink basic header includes a 2-byte timestamp (representing the number of seconds elapsed since the start of the most recent half-day period).  
When buffering, this timestamp must be expanded to 4 bytes to avoid ambiguity after delayed transmission.  

The modified header (called the [*Special Long Timestamp Header*](./application-uplink.md#special-long-timestamp-header)) has the **S-bit** set, allowing the decoder to infer the size of the replay frame timestamps.
:::

---

## Configuration

The feature is controlled by the parameter:  

[**`core_db_type_mask`**](./configuration.md#core_db_type_mask) — a 7-byte array that defines which uplinks should be stored.  

- **Byte 0: Non-notification uplinks**  
  - Bit 0: Store positions  
  - Bit 1: Store telemetry data  
- **Byte 1:** Notification class 0 (general notifications)  
- **Byte 2:** Notification class 1 (SOS-related)  
- **Byte 3:** Notification class 2 (temperature-related)  
- **Byte 4:** Notification class 3 (accelerometer-related)  
- **Byte 5:** Notification class 4 (network-related)  
- **Byte 6:** Notification class 5 (geozoning-related)  

:::tip
- Setting `core_db_type_mask` to `{00,00,00,00,00,00,00}` disables data buffering.  
- To save a notification in the buffer, both `core_notif_enable` **and** `core_db_type_mask` must be enabled for that notification.
:::
