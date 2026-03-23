---
keywords: [ AT3, AT3_v1.4 ]
sidebar_position: 9
---

# Payload manager

This manager is responsible of creating the uplink messages and
distributing the downlinks.

The payload manager works closely with the network manager.

## Uplink processing

The manager is registered against system events that requires a message
transmission. It creates the payloads by selecting the appropriate
header (single versus multi-frame) and build the data part.

***Multi-frame processing***

In the case of position messages, the manager may use the multi-frame
format. In this case, an extended header is added to the basic header.
The extended header contains a group identifier, the last frame bit and
the frame identifier.

The group identifier helps the application server to ensure that all
frames received belong to the same group. The group identifier is
incremented for each new multi-frame payloads. It should be used by the
application server to identify which frames belong to a given group.
This is particularly useful in case of message lost or unordered
reception.

The last frame bit in the extended header indicates whether the group is
ended. However, note that in a particular case, this bit may not be set.
This case arises only if there are more than the maximum frame in a
group and the payload manager stopped the multi-frame processing. In
such a case, the application server will rely on the frame identifier to
know that the group is ended: the identifier will be the maximum value
for the frame identifier.

Note that it is possible that the extended header is used with a single
frame. This case may arise for configuration replies, since the data
part of the parameters is variable.

To conclude, the application server should process as follow:

- The last bit is set, frame ID less than the max: End of group
  detected. Group complete.
- The last bit is set, frame ID equals to the max: End of group
  detected. Group complete.
- The last bit is not set, frame ID equals to the max: End of group
  detected. Group truncated by the payload manager.
- The last bit is set, frame ID = 0: Single payload sent using the
  multi-frame format.

Refer to the Application uplink paragraph, Extended header section for
the maximum number of groups and frame identifiers.

***Network down***

When the network is not available (pipe down), the payload manager
stores the notifications and the last position message. Only one
notification type per class is kept. These notifications are the ones
sent via the network and not the system event (refer to the the uplink
message section). The notification storage is done via an array of
notification classes, for which, each entry consists of the notification
type and the date at which it occurred.

Once the network is recovered, the payload manager will create all
notifications and the last position message (if any) and send it to the
network.

***Network hold-on***

While connected to the backup network, the network manager probes
regularly the main network. In this case the application cannot transmit
(since we don't know the actual network to use) and the data pipe is
down.

## Position reporting

### Overview

The payload manager is responsible of reporting the positions. The
position can be either in single frame or multi-frames depending on the
geolocation results.

When multiple technology must be reported, each single frame contains
only one technology type.

If a scan (BLE, WIFI or LR-AGPS) requires more than one frame to be
sent, they are also sent in multi-frame mode. All frames related to a
given technology are sent contiguously and they are ordered. In such a
case, each frames contains the technology type it refers to.

This means that a complete position report in multi-frames mode can
contain multiple technology types and multiple frames related to a
single type.

### Geolocation mode Always vs fallback

A technology having the always-done mode is always reported even if it
fails or it is not solvable.

A technology having the **fallback** mode is reported only if is
successful or if there is no other technologies

Note that a position report is always sent. For example if a geolocation
consists of a single technology and it fails, the report is sent
regardless the mode (Always-done or fallback).

### Geolocation not-solvable/failure status

The geolocation may report a status not-solvable for a given technology.
This section covers this specific case and indicates the way the
position is reported in the case where an acquisition is done with
multiple technologies.

The rules are:

- If there is a single technology type, the position is reported with
    the not-solvable/failure status.
- If there are a multiple technology types, a **fallback** technology
  with the not-solvable/failure status is reported only if:
  - There is no other technologies to schedule in the geolocation
    profile.
  - All other technologies are also in fallback mode and they fail
    or are not solvable. In this case, only the last technology is
    sent.

**Examples**:

- BLE fallback only. Scan not-solvable .Geolocation profile:
\{03,00,00,00,00,00\}.
  - The position (single frame) should be BLE with status not-solvable

- BLE fallback not-solvable, WIFI fallback success. Geolocation profile: \{03,02,00,00,00,00\}
  - The position (single frame) should be WIFI with status success

- BLE fallback not-solvable, wifi fallback no-solvable. Geolocation profile: \{03,02,00,00,00,00\}
  - The position (single frame) should be WIFI with status not-solvable

- BLE Always not-solvable, wifi fallback no-solvable .Geolocation profile: \{83,02,00,00,00,00\}
  - The position (single frame) should be BLE with status not-solvable

- BLE Always not-solvable, wifi always no-solvable. Geolocation profile: \{83,82,00,00,00,00\}
  - The position (multi frames frame) should be BLE with status not-solvable

- BLE Always not-solvable, wifi always no-solvable. Geolocation profile: \{83,82,00,00,00,00\}
  - The position (multi frames frame) should be BLE with status not-solvable followed by a WIFI position with status not solvable.

- BLE fallback not-solvable, wifi always no-solvable. Geolocation profile:
\{03,82,00,00,00,00\}.
  - The position (single frame) should be WIFI with status not-solvable
