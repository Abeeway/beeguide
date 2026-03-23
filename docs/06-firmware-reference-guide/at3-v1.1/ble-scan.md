---
keywords: [ AT3, AT3_v1.1 ]
sidebar_position: 8
---

# BLE scan

This section focuses on the BLE scan geolocation technology.

## Configuration

### Standard scan parameters and filtering

The BLE scan configuration is done via the configuration group 4.

The ***ble_scan_duration***, ***ble_scan_window*** and
***ble_scan_interval*** define the configuration of the scan.

The parameter ***ble_scan_type*** configures the type of beacon we
expect.

The ***ble_scan_min_rssi*** configures the minimum received power level
of a beacon for processing. Beacons received below this threshold will
be ignored.

This service offers an enhanced filtering scheme based on two filters.
Each filter contains an offset (*ble_scan_filterX_offset)* locating the
first byte of the advertisement data part. The beginning of the
advertisement part is related to the type of expected beacons:

-   Eddystone UUID beacons: the offset 0 locates the first byte of the
    name-space.
-   Eddystone URL beacons: The offset 0 locates the URL schema prefix.
-   Eddystone TLM beacons: The offset 0 locates the first byte of the
    battery voltage.
-   iBeacons: The offset 0 locates the first byte of the company UUID.
-   altBeacons: The offset 0 locates the first byte of the beacon D.
-   custom: The offset 0 locates the beginning of the advertisement
    frame.

The filter mask (*ble_scan_filterX_mask*) with its offset
(*ble_scan_filterX_offset*) and the filter value
(*ble_scan_filterX_value*) define the application of the filter: For
each byte of the advertisement data, the process performs a logical AND
between the data and the mask from the offset until the actual length of
the mask and the result is finally compared to the filter value. If
there is no match, then the advertisement is ignored.

Note that the length of the filter is given by the size of the filter
(10) minus the number of null bytes starting from the end. Examples:

-   A filter mask equals to \{FF,FF,FF,FF,00,00,00,00,00,00\} has an
    actual size of 4.
-   A filter mask equals to \{FF,FF,FF,FF,00,FF,00,00,00,00\} has an
    actual size of 6.
-   A filter mask equals to \{00,00,00,00,00,FF,00,00,00,00\} has an
    actual size of 6.

The filter match is done on the actual size of the filter. So, If the
data part length is less than the actual filter size, the process
filters out the beacon.

When configuring the two filters, the beacon will be valid only if the
two filters match.

***Notes***
-   The filtering is not applicable if the parameter ***ble_scan_type***
    is all-beacon or exposure.
-   If the ***ble_scan_type*** is set to custom, it is advised to setup
    filters unless you expect to receive all type of beacons.

### Reporting

The BLE scan reporting is the result of the scan operation. The
configuration defines what should be reported via the Network (LoRaWAN
or LTE).

The following parameters configure the reporting:

-   ***ble_scan_nb_beacons***: Configure the number of beacons that
    should be reported.
-   ***ble_scan_report_id_ofs***: Configure the type of information the
    report should contain:
    -   MAC address: Beacon MAC address.
    -   Short beacon ID: Identifier on 2 bytes extracted from the
        advertisement data.
    -   Long beacon ID: Identifier on 16 bytes extracted from the
        advertisement data.
-   ***ble_scan_report_id_ofs***: Locate the first byte that should be
    extracted from the advertisement data to form the short or long
    beacon ID.

***Notes***
-   The ***ble_scan_report_id_ofs*** parameter is applicable only if the
    ***ble_scan_report_id_ofs*** is either short or long beacon ID.
-   As for the filtering, the beginning of the advertisement part is
    related to the type of expected beacons. Refer to the filtering
    section to locate properly the first byte to form the beacon ID.
-   The short beacon ID cannot be used is the ***ble_scan_type*** is
    all-beacon or exposure.
  
