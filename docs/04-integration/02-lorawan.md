---
title: LoRaWAN Integration
sidebar_position: 2
---

# Integration with LoRaWAN connectivity

With LoRaWAN connectivity, the integration flow typically follows one of the following patterns:

> `Device` ⇒ `Gw` ⇒ `LNS` with `Driver` ⇒ `AS`  
> `Device` ⇒ `Gw` ⇒ `LNS` ⇒ `AS` with `Driver`

The components are:

- `Device`: Abeeway tracker device
- `Gw`: LoRaWAN gateway
- `LNS`: LoRaWAN Network Server
- `Driver`: the JavaScript decoder/encoder library
- `AS`: Application Server

The Driver can be hosted either on the LNS or on the AS.

If the Driver is hosted on the LNS, the AS receives decoded messages in JSON format.

If the Driver is hosted on the AS, the AS receives the device payload in encoded form and must decode it using the Driver.

The `LNS` ⇒ `AS` connection can be implemented on various protocols, depending on the capabilities of the LNS. Typical examples are HTTP and MQTT.
