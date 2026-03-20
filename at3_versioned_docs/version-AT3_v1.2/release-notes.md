---
keywords: [ AT3, AT3_v1.2 ]
sidebar_position: 1.1
---

# Release Notes

## New features
- **Improved stability of the BLE Command Line Interface**.
- **Configurable minimum number of BLE beacons for successful BLE location**, through new parameter ***ble_scan_min_beacons***
- **Configurable minimum number of Wi-Fi SSIDs and RSSI for successful Wi-Fi location**, through new parameters ***lr_wifi_min_nb_bssid*** and ***lr_wifi_min_rssi parameter***
- **Improvements of cellular connectivity manager**, various improvements for greater stability, including a new echo-request / echo-reply primitive for proactive monitoring. FQDNs can now be used instead of IP adresses. In v1.1 slow DNS resolutions could cause the cellular modem to disconnect.

## Known-issues 
### AT3 v1.2.2
- **Battery level reported through DevStatusReq response reflects the battery voltage** (fixed in v1.3). Use the application layer battery capacity reporting instead for primary battery powered trackers (like Compact and Combo trackers) as battery voltage remains constant for the most part of the discharge curve. Will be fixed in a later release to also reflect the same metric reported by our application layer, based on a capacity estimator using precise integration of tracker energy use for each activity.
- **Random datarate distribution is unbalanced** (fixed in v1.3). Depending on the datarates activated in parameter 0x0906 (lorawan_s1_tx_strategy), some datarates may be used significantly more often than others if some datarates are disabled. Check, for your specific setting, if the distribution is suitable.
- **uplinks buffered during probing primary network get lost if the network switches to primary** (fixed in v1.3). Packets are not lost if the probe fails and the device remains on backup network. 

### AT3 v1.2
-	**Wifi sniffing may hang if interrupted** (fixed in v1.2.2). The driver responsible for Wi-Fi sniffing may remain stuck in state "abording" if interrupted during a scan.
Such abort may occur if an on-demand fix or stop event fix uses a location profile requiring a different location method to be used in priority.
This bug has a side effect which causes a reset on the next access to the flash memory, e.g. "conf save" command.
- **Reset on "conf save" command** (fixed in v1.2.2). Related to previous issue.
- **Battery level reported through DevStatusReq response reflects the battery voltage**. Use the application layer battery capacity reporting instead for primary battery powered trackers (like Compact and Combo trackers) as battery voltage remains constant for the most part of the discharge curve. Will be fixed in a later release to also reflect the same metric reported by our application layer, based on a capacity estimator using precise integration of tracker energy use for each activity.
- **Repeated "Motion start" event, without "Motion stop"** (fixed in v1.2.2).  Motion start triggers happen with a period equal to "motion_duration", without any "Motion stop" trigger in between. There are two ways to trigger this behavior:
    - Configure a "motion_duration" value lower than the accelerometer chip "wake" timer for the configured sampling rate (about 42s in the default ODR=12.5 Hz). v1.2.1 enforces a safe minimum value of "motion_duration" for the configured ODR.
    - Race condition between the accelerometer interrupt and an accelerometer 10s poll timer using different threads, causing the driver state to become desynchronized (very rare occurence). v1.2.1 uses the same thread for the two conflicting events.

Both issues can be resolved remotely by sending an accelerometer configuration downlink command (which resets the accelerometer subsystem), or a full reset command.
- **Random datarate distribution is unbalanced**. Depending on the datarates activated in parameter 0x0906 (lorawan_s1_tx_strategy), some datarates may be used significantly more often than others. Check, for your specific setting, if the distribution is suitable. This issue will be fixed in AT3 v1.3 (second half of September 2025)
