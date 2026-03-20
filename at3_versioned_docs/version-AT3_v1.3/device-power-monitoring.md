---
keywords: [ AT3, AT3_v1.3 ]
sidebar_position: 37
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


## Managing low-power shut-down (brownout)

### Rechargeable battery devices

When the main functional state machine processes a **low battery system event** (critically low-battery condition detected by the power manager), the following actions occur:

- A **battery low power notification** is sent via the network  
- **Geolocation** is stopped  
- The **accelerometer** is stopped  
- **BLE activities** (connectivity, beaconing) are stopped  
- The **network** is stopped  
The main FSM moves to the **Shutting-down** state, sends a `core_stdn` system event, and five seconds later transitions to the **Off** state, sending a `core_off` system event. This delay allows to send the residual network events.

To restart the system, one of the following actions must be performed:

- Press a button (if the `start_device` action is mapped to the button)  
- Plug a USB cable into the tracker (recharging the battery)

## Primary Battery devices

When the main functional state machine processes a **low battery system event**, the only action taken is sending a **battery low notification** to the network.

The system remains in the **Running** state until a **brownout reset** occurs (triggered by the MCU). If the voltage is sufficient, the MCU will attempt a restart, which can cause restart loops and useless network trafic. In order to prevent this, when it restarts after a brownout reset and in low battery condition, the firmware checks the **tamper switch presence and state**:

- **Tamper switch absent**  
  - The application stays in the **Off** state and starts a **6-hour timer**.  
  - When the timer expires, the system transitions to the **Running** state and attempts to:  
    - Connect to the network  
    - Restart the accelerometer  
    - Restart geolocation  
    - Restart BLE activities  

- **Tamper switch present**  
  - If rebooting with tamper **off** (casing closed), the 6-hour timer is started.  
  - If rebooting with tamper **on** (casing open), the 6-hour timer is **not** started and the system restarts immediately.  
  **Note**: If tamper was **off** and the 6-hour timer was started, opening the casing (tamper **on**) forces a system restart.  
This mechanism is implemented because when batteries are replaced while in the **Off** state (due to low battery), the tracker may not reset immediately. This is caused by the slow discharge of the **supercap**, which drains very little current and takes a long time.