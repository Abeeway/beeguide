---
keywords: [ AT3, AT3_v1.1 ]
sidebar_position: 3
---

# Device and power monitoring

This manager monitors the system. It generates a core system event when
the monitoring timer elapses. The timer period is defined by the
***core_monitoring_period*** parameter. This manager is paused in OFF
state.

## Device manager

The device manager monitors the temperature.

The temperature monitoring process consists of the following steps:
1.   Measure the current temperature
1.  Compare it to the minimum and maximum values stored in the internal
    configuration parameter group
1.   Update the associated internal parameter if a new minimum or a new
    maximum is detected
1.   Compare the current temperature against the configuration parameters
    ***core_temp_high_threshold*** and ***core_temp_low_threshold*** and
    deduce whether we are in critical high, critical low or normal
    temperature state

## Power manager

The power manager collects the consumption of the tracker components and
calculates the total power consumption.

Based on the battery type a specific process takes place:
-   **Primary battery**: Each time the total consumption exceeds by 5%
    the previous one, the manager saves the consumption in the
    associated internal configuration parameter (in flash).
-   **Rechargeable battery**: The battery voltage is measured and
    converted into a remaining charge percentage. The manager does not
    store permanently the consumption in the internal configuration
    parameter. The manager also detects the presence of the USB cable
    connection. If connected, the battery is charging and the charge
    percentage is set to the special 0 value (reported via uplinks).
    Once the cable is disconnected, the manager resets the consumption
    of all consumers, so the power consumption reported is counted from
    last battery charge. Please note that the battery level reported may
    show less than 100% as it is estimated based on the voltage for
    rechargeable batteries. The charger operates with a voltage
    hysteresis to prevent continuous charging of a full battery: it
    allows the battery to discharge to a threshold before recharging
    begins again. If the cable is disconnected at the lowest voltage
    point, the battery may be reported as less than 100%.

When the battery monitoring is called the USB cable state is checked in
case of rechargeable battery:
-   If connected the system event ***type_power_charging*** is sent .
-   If disconnected the system event ***type_power_not_charging*** is
    sent .

At the end of the processing, the power manager ensures that there is
enough energy in the battery. If it is not the case it sends a
***type_power_low_battery*** to the system to signal a critically low
level.

The condition to trigger the event is:
-   **Primary battery**: If the last reset cause was a brown-out the event
    is sent. This will put the system to OFF state, preventing a
    potential condition of cyclic brownout resets followed by network
    activity (e.g. LoRaWAN startup message).
-   **Rechargeable battery**: If the remaining battery charge is lower or
    equal to 5% the event is sent.