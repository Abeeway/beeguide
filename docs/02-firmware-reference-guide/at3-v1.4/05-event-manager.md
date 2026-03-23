---
keywords: [ AT3, AT3_v1.4 ]
sidebar_position: 5
---

# Event manager

The event manager handles the application events. Any part of the application can register one or more event classes with the event manager to receive the corresponding events.

Each application event is composed of a class and a type. A class represents a set of events related to a specific functionality, while a type refers to a specific event within the class.

The event manager maintains an event queue (a FreeRTOS queue), that can hold up to 40 events. The events are distributed one by one to the software components registered with the event manager.

## Event classes and types

The AT3 application supports the following classes and types

### Class 0 and 1: Button_1 (0) & Button_2 (1)

| Event type                | ID | Comments                                         |
|---------------------------|----|--------------------------------------------------|
| type_btn_press            | 0  | Button press                                     |
| type_btn_long_press       | 1  | Button long press                                |
| type_btn_1_click          | 2  | Single click                                     |
| type_btn_2_clicks         | 3  | Double clicks                                    |
| type_btn_3_clicks         | 4  | Triple clicks                                    |
| ‍type_btn_simple_seq       | 5  | Button simple sequence has been detected.         |
| type_btn_seq_reset        | 6  | Button reset sequence has been detected.          |
| type_btn_seq_bond_del     | 7  | Button bond delete sequence has been detected.    |
| type_btn_seq_ble_boot     | 8  | Button BLE bootloader sequence has been detected. |
| type_btn_ble_connectivity | 9  | Button event to start connectivity.              |

:::note
The very long press event (14s+) and the detection of special command sequences is implemented by the button driver and not available for customization by the application, hence these special command actions are not reported as events.
:::

### Class 2: Buzzer

| Event type         | ID | Comments                          |
|--------------------|----|-----------------------------------|
| type_buzzer_on     | 0  | The buzzer is playing             |
| type_buzzer_off    | 1  | The buzzer is no more playing     |

### Class 3: Accelerometer

| Event type                | ID | Comments                                               |
|---------------------------|----|--------------------------------------------------------|
| type_acc_motion_start     | 0  | Motion start detected.                                 |
| type_acc_motion_end       | 1  | Motion end detected (after motion duration timeout).   |
| type acc_shock_detected   | 2  | A shock has been detected.                             |
| ‍type_acc_clear_motion     | 3  | Clear motion percentage statistics event.              |

### Class 4. Power

| Event type                 | ID  | Comments                                             |
|----------------------------|-----|------------------------------------------------------|
| type_power_battery_low     | 0   | Critically low battery level detected                |
| type_power_charging        | 1   | Battery is charging                                  |
| type_power_not_charging    | 2   | Battery is no more charging                          |
| type_power_battery_normal  | 3   | Battery back to normal after replacement or charging |

### Class 5. Temperature

| Event type        | ID  | Comments                                                   |
|-------------------|-----|------------------------------------------------------------|
| type_temp_normal  | 0   | Temperature back to normal (within minimum and maximum thresholds) |
| type_temp_low     | 1   | Temperature fell below the minimum threshold               |
| type_temp_high    | 2   | Temperature increased above the maximum threshold          |
| ‍type_temp_update  | 3   | Temperature measure updated‍ with a new reading.            |

### Class 6. Geolocation

| Event type                 | ID  | Comments                                  |
|----------------------------|-----|-------------------------------------------|
| type_geoloc_start          | 0   | Geolocation has started                   |
| type_geoloc_done           | 1   | Geolocation completed (trigerred after each individual technology) |
| ‍type_geoloc_complete       |	2   | Geolocation engine completed an acquisition (the whole sequence of technologies). |
| type_geoloc_abort          | 3   | Geolocation has been aborted              |
| type_geoloc_timeout_acq    | 4   | Geolocation timeout occurred              |
| type_geoloc_timeout_hold   | 5   | GNSS hold mode timeout occurred           |
| type_geoloc_geozoning_in   | 6   | Geozoning indoor event has been raised    |
| type_geoloc_geozoning_out  | 7   | Geozoning outdoor event has been raised   |

### Class 7. Configuration

| Event type             | Comments           |
|------------------------|--------------------|
| Bitmap of config group | A configuration change has occurred. Impacted groups are encoded as `1<<groupID` in the bitmap. This event is managed internally to AT3. |

### Class 8. Network

| Event type                        | ID  | Comments                                      |
|-----------------------------------|-----|-----------------------------------------------|
| type_network_main_up              | 0 | Main network up.                                |
| type_network_backup_up            | 1 | Backup network up.                              |
| type_network_down                 | 2 | Network is down. No connectivity at all         |
| type_network_hold                 | 3 | Network is temporarily not available            |
| type_network_pipe1_up             | 4 | Data pipe 1 up. Traffic accepted on this pipe.  |
| type_network_pipe1_down           | 5 | Data pipe 1 down. Traffic refused on this pipe. |
| type_network_pipe1_rx_data        | 6 | Data pipe 1 has available RX data               |
| ‍type_network_cellular_lpm_changed | 7 | Cellular network lpm changed (see note)         |

:::note
The event `type_network_cellular_lpm_changed` is triggered when the power consumption of the LTE module changes depending on the low power mode (LPM) accepted by the network. For example, during an initial connection attempt, the LTE module requests to use PSM mode as its LPM. If the network accepts this mode, a `type_network_cellular_lpm_changed` event is generated. If the tracker moves to a cell that does not support PSM, the application processor receives a "URC" (Unsollicited Result Code) notification from the cellular modem indicating that PSM is no longer supported. This again triggers a `type_network_cellular_lpm_changed` event, which accurately reflects the change in LPM mode of the LTE module.
:::

### Class 9. Core**

| Event type               | ID  | Comments                                           |
|---------------------------|-----|---------------------------------------------------|
| type_core_app_init_done   | 0   | Application has ended initialization              |
| type_core_off             | 1   | Core application moved to the off state           |
| type_core_skip_off        | 2   | Core was expected to move in off mode but the configuration prevents it |
| type_core_running         | 3   | The core application is running                   |
| type_core_hold            | 4   | The core application moved to the hold state. Reserved for future use. |
| type_core_time_update     | 5   | The system time has been updated                  |
| type_core_device_start    | 6   | A start action for the core has been issued       |
| type_core_device_stop     | 7   | A stop action for the core has been issued        |
| type_core_sos_start       | 8   | A SOS start action has been issued                |
| type_core_sos_stop        | 9   | A SOS stop action has been issued                 |
| type_core_status_ul       | 10  | The sending of a status uplink has been requested |
| type_core_monitoring      | 11  | The timeout of the monitoring timer has elapsed   |
| type_core_pod             | 12  | A position on demand has been requested           |
| type_core_refresh_alm     | 13  | Almanac refresh                                   |
| type_core_tamper_on       | 14  | Tracker casing is open                            |
| type_core_tamper_off      | 15  | Tracker casing is closed                          |
| type_core_gnss_timeout    | 16  | GNSS core timeout                                 |
| type_core_battery_level   | 17  | Show battery level                                |
| ‍type_core_vbus_on         | 18  | VBUS connected‍                                    |
| type_core_vbus_off        | 19  | VBUS disconnected‍                                 |
| type_core_heartbeat       | 20  | Instructs the system to send a Heartbeat message to open a downlink Rx slot. |
| type_core_join_to_activate | 21 | Notifies the application that the LoRa subsystem has successfully joined a network, allowing it to transition to the active state (see note). |
|type_core_stdn	            | 22  |	Core application shutting-down.                   |

:::note
Event `type_core_join_to_activate` is used when the application has been configured in factory to start in "Join-then-activate" mode. refer to [Startup process documentation](https://docs.preprod.thingpark.com/thingpark-location/firmware/functioning#startup-process) for more details.
:::

### Class 10. BLE connectivity/beaconing

| Event type             | ID  | Comments                              |
|-------------------------|-----|--------------------------------------|
| type_ble_conn_start     | 0   | Start advertisement for connectivity |
| type_ble_conn_stop      | 1   | Stop connectivity                    |
| type_ble_conn_idle      | 2   | No connection nor advertisement      |
| type_ble_conn_fast_adv  | 3   | Fast advertisement for connectivity  |
| type_ble_conn_slow_adv  | 4   | Slow advertisement for connectivity  |
| type_ble_connected      | 5   | BLE is in the connection state       |
| type_ble_conn_link_lost | 6   | Connection lost                      |
| type_ble_bonded         | 7   | BLE is securely connected (bonded)   |
| type_ble_beacon_start   | 8   | BLE beacon started                   |
| type_ble_beacon_stop    | 9   | BLE beacon stopped                   |
| type_ble_reduce_cnx_speed_rqst | 10 | Instructs the BLE manager to persist the current connection parameters and transition to low-duty cycle parameters, minimizing flash memory contention and allowing the application to perform write operations |
| type_ble_reduce_cnx_speed_done | 11 | Confirms that the BLE manager has successfully applied low-duty cycle connection parameters. |
| type_ble_restore_cnx_speed_rqst | 12 | Instructs the BLE manager to restore the previously saved connection parameters. |

### Class 11. User

| Event type                | ID  | Comments      |
|---------------------------|-----|---------------|
| core_event_type_user_1    | 0   | User event 1  |
| core_event_type_user_2    | 1   | User event 2  |
| core_event_type_user_3    | 2   | User event 3  |
| core_event_type_user_4    | 3   | User event 4  |
| core_event_type_user_5    | 4   | User event 5  |

### Class 12. FUOTA

| Event type                   | ID  | Comments                                 |
|------------------------------|-----|------------------------------------------|
| type_fuota_download_xmodem   | 0   | Start firmware download with xmodem      |
| type_fuota_download_ble      | 1   | Start firmware download with BLE service |
| type_fuota_download_complete | 2   | Firmware download complete               |
| type_fuota_download_success  | 3   | Firmware download success                |
| type_fuota_download_failure  | 4   | Firmware download failure                |
| type_fuota_download_rx_data  | 5   | Firmware chunk received                  |
| type_fuota_mcu_transfer      | 6   | Start updating downloaded firmware       |
