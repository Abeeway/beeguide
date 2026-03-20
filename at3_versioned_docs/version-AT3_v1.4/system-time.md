---
sidebar_position: 60
---

# System time update

Currently, the tracker requests the current date and time via the LoRaWAN or LTE network at startup, once it has successfully joined the network. Note that the system clock will drift over time due to the accuracy of the 32 kHz clock (approximately 10 ppm), so the system time should be updated periodically.

The system time is also updated each time a successful GPS fix is obtained. This technique works correctly only if the MT3333 module is present and the GPS fix technology is configured to be **always-done**.

## Systime update using the active network

The system time update is performed when connecting to the main or backup network, joining a LoRaWAN network, or registering with an operator on an LTE network. However, the system time update via the network may fail.
To address such a failure, the system  will automatically request the UTC time once per hour until successful.

**Note:**  The "one hour" period is rounded to a multiple of the monitoring period. Example for a monitoring period of 23 minutes this will lead to a retry frequency of 60/23 = 2.6 rounded to 3. So the actual retry period would be 3*23 = 69 minutes.
The netwok manager will redirect the system time update request to  the active network (LoRaWAN or LTE).

## Clock drift correction

Once the UTC time is acquired, the system time is updated **once every week** when the monitoring period elapses.
