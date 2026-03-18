---
title: Cellular Network Integration
sidebar_position: 3
---

# Integration with Cellular connectivity

With cellular connectivity, the typical integration flow is:

> `Device` ⇒ `Cellular Network` ⇒ `AS` with `Driver`

In this case, the Driver must be hosted on the AS. The AS receives the device payload from the network in encoded form and must decode it using the Driver.

The `Cellular Network` ⇒ `AS` connection currently uses unencrypted UDP. For production deployments, a private APN is therefore recommended to secure the connection between the cellular network and the Application Server.

Abeeway plans to introduce a future firmware feature to secure UDP communication using symmetric keys. At the time of writing, this feature is not yet available.
