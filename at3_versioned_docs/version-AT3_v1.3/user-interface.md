---
keywords: [ AT3, AT3_v1.3 ]
sidebar_position: 38
sidebar_label: User Interface
---

# User Interface


This chapter explains how to configure the User Interface (UI), which
includes the following components:
-   LEDs
-   Buzzer
-   Buttons

Please note that certain boards may lack one or more of these UI
components.

## User button 

### Overview

AT3 supports up to 2 buttons, referred to as respectively button1 and
button2.

The value of timers used to detect button press and long press actions
are configured in the configuration parameter **core_buttons_timing**.

Each button has a specific configuration parameter
(***core_button1_map*** / ***core_button2_map***) which is defined by a
32-bit integer bitmap. This parameter establishes a link between a
button action and a system event to be triggered.

When an action is performed on a button (such as press, long press,
etc), the following process occurs:

1.  The system event associated with the button action is triggered
    (class **button_x**, event **type_btn_y**).
2.  If the action is configured to trigger an extra system event via the
    button's configuration, a second system event is sent.

For example, if button1's configuration links the Position On Demand
event to a button press, each press on button1 will generate the
following two system events:

-   Event 1: class: **button_1**, type: **type_btn_press**
-   Event 2: class: **core**, type: **type_core_pod**

### Configuration

In the ***core_button1_map*** and ***core_button2_map*** parameters, the
link defining the system event linked to each button action is coded on
4 bits:

-   Bit 0-3: Event generated on a button press.
-   Bit 4-7: Event generated on a button long press.
-   Bit 8-11: Event generated on a button single click.
-   Bit 12-15: Event generated on a button double clicks.
-   Bit 16-19: Event generated on a button triple clicks or above.
-   Bit 20-23: Event generated on a button simple sequence (see below)
-   Bit 24-31: RFU

The button simple sequence is a hard coded sequence designed for magnet
feature activation through Reed switch of Hall effect sensors (it will
not activate in case of continuous magnet presence):

1.  Switch closed (equivalent to button press) for "button press"
    duration (by default 3s)
2.  Switch release for "button press" action duration (by default 3s)
3.  Switch closed for "button press" duration (by default 3s)

System event codes:

-   0 -- No action
-   1 -- Send the battery level display system event
-   2 -- Start and Stop the SOS
-   3 -- Request a position on demand (POD)
-   4 -- Force an uplink system status notification transmission
-   5 -- Start device
-   6 -- Stop device
-   7 -- Start only SOS
-   8 -- Start BLE advertisement for connectivity
-   9 -- Reset
-   10..15 - RFU

For example, to trigger the "Battery level display" system event on the
single click action, the 4-bit code is 0b0001 (0x1), and of no other
action is linked, the ***core_buttonX_map*** parameter would be:
0x00000100.

Each part of the bitmap of ***core_buttons_timing** is coded as below*:
-   Bit 0-3: Duration of the button press in half-seconds.
-   Bit 4-7: •	Extra press duration required to detect a long press, in half-seconds.
-   Bit 8-15: Debounce duration on button 1 in milliseconds.
-   Bit 16-23: Debounce duration on button 2 in milliseconds.
-   Bit 24-31: RFU

***Notes***

-   The button press and long press duration are the same for all
    buttons, the duration of the button press cannot be equal or greater
    than long press, the minimum value for a button press duration is 1s
    and for long press duration 2s.

-   **The duration of the button press and long press cannot be null.**
-   If the event *start device* is not mapped on either
    ***core_button1_map*** or ***core_button2_map***, the device
    automatically starts after the startup procedure (skip the off mode)
-   If the event *stop device* is not mapped on either.
    ***core_button1_map*** or ***core_button2_map***, the device cannot
    move to the off state.

### Special sequences

AT3 supports complex button sequences to trigger system configuration
commands.

When a button is held for more than 14 seconds, the AT3 firmware
switches into a special configuration command mode, indicated by a
unique melody. On devices equipped with a buzzer, the system will emit a
beep every second to help gauge the duration.

In the special configuration command mode, AT3 will be expecting one of
the following button actions:

  
|**Special Sequence**   |    **Action**   |  **User Interface behavior**|
|--------------------------|--------------------|----------------------- |
|Hold the button for 14 sec, 1 click, Triple-click or more, 1 Press |  Enter the BLE  bootloader |  Tracker will play 3 beeps |
|Hold the button for 14 sec, 1 click, Double-click, 1 Press |  Enter the MCU bootloader |       Tracker will play 2 beeps followed by MCU bootloader reset melody |
|Hold the button for 14 sec, 1 click, 1 click, 1 Press |  Remove the BLE bond information |  Tracker will play 1 beep followed by Bluetooth bond removal melody| 


**Notes**
-   On success, the tracker plays a success melody followed by the
    number of beeps defined in the table above.
-   On failure, the tracker plays an error melody and exits the
    special-sequence mode. Failures are detected upon:
    -   No button action is performed within 10 seconds
    -   An unknown sequence pattern has been detected

## LEDs

### Overview

AT3 supports two LEDs. For each of them, AT3 provides a flexible way to
configure a specific pattern according to a given system event (refer to
Event manager). In other word, a given system event can play a given
pattern.

Note that in order to choose your favorite pattern, a system CLI command
has been implemented to play them.

### Configuration

The configuration consists of a pattern and a sequence. The sequence is
the number of time the pattern will be played.

For each LED, there is a configuration parameter typed as byte array.
The byte array is split in 10 slices of 3 bytes each. Each slice
configures a pattern for a system event.

The parameter is defined as follows:

<table>
  <tbody>
    <tr>
      <td colspan="3"><strong>Slice 1</strong></td>
      <td colspan="3"><strong>Slice 2</strong></td>
      <td><strong>...</strong></td>
      <td colspan="3"><strong>Slice 10</strong></td>
    </tr>
    <tr>
      <td>Byte 0</td>
      <td>Byte 1</td>
      <td>Byte 2</td>
      <td>Byte 0</td>
      <td>Byte 1</td>
      <td>Byte 2</td>
      <td></td>
      <td>Byte 0</td>
      <td>Byte 1</td>
      <td>Byte 2</td>
    </tr>
    <tr>
      <td>ext/cls</td>
      <td>type</td>
      <td>pattern</td>
      <td>ext/cls</td>
      <td>type</td>
      <td>pattern</td>
      <td></td>
      <td>ext/cls</td>
      <td>type</td>
      <td>pattern</td>
    </tr>
  </tbody>
</table>




*Where*

-   **ext/cls:** Pattern extension and system event class.
    -   bit 0..4: System event class. Refer to the [Event manager](./event-manager)
        section.
    -   bit 5..6: Pattern count extension (Most significant bits).
    -   bit 7: Pattern inversion:
        -   0 -- The pattern is played as defined.
        -   1 -- The pattern is inverted.
-   **type**: System event type. Refer to the [Event manager](./event-manager) section.
-   **pattern**: Pattern configuration:
    -   bit 0..3. Pattern identifier:
        -   0 -- None. Not configured
        -   1 -- LED off. Pattern duration: Infinite
        -   2 -- LED on. Pattern duration: 1s
        -   3 -- Fade in. Pattern duration: 2.5s. Usually used for
            device power on
        -   4 -- Fade out. Pattern duration: 2.5s. Usually used for
            device power off
        -   5 -- Blink slow: On: 1000ms, Off: 1000ms. Pattern duration:
            2s
        -   6 -- Blink medium: On: 500ms, Off: 500ms. Pattern duration:
            1s
        -   7 -- Blink fast: On: 250 ms. Off: 250 ms. Pattern duration:
            0.5s
        -   8 -- Flash slow: On: 100ms, Off: 2s. Pattern duration: 2.1s
        -   9 -- Flash fast: On: 100ms, Off: 1s. Pattern duration: 1.1s
            Usually used for SOS
        -   10 -- Heart: On: 100ms, Off: 250s, On: 100ms, Off: 1s.
            Pattern duration: 1.35s
    -   bit 4..7. Pattern count (Least significant bits): Number of
        times the pattern is displayed. Used in combination with the
        **Pattern count extension**. A combined value of 0 means
        infinite

***Notes***
-   The pattern inversion is used to alternate a pattern on two LEDs.
-   To avoid confusion, while a pattern is played it cannot be
    interrupted by another pattern except the SOS or pattern ***LED
    off.***
-   If a slice maps the *SOS start* event, the associated pattern will
    not be interrupted until the sequence duration is complete or if the
    *SOS stop* event is received. So there is no need to map the SOS
    stop event. Note that the pattern ***LED off*** won't stop the SOS.
-   The battery remaining percentage display has a particular handling.
    Refer to the dedicated paragraph. **The LED should not be configured
    for this** (only the button needs to be configured).

### Sequence duration calculation

The number of pattern loops is built using the bits 5 and 6 of the
**ext/cls** field and the bits 4..7 of the **pattern** field.

The formula to use:

n = **Pattern count** + ((**ext/cls** & 0x60) \>\> 1)

Where
-   n means the number of times the pattern will be played
-   The symbol **\>\>** means right shift
-   The symbol **&** means logical AND.

This gives a maximum of 63 number of times the pattern will be played.

Another formula would be:

n = **Pattern count** + (**ext/cls**\[bit 5\] \* 16) + (**ext/cls**\[bit
6\] \* 32)

The sequence duration becomes

duration = n \* pattern duration

### Examples

***Example 1***

The LED 0 is configured with to slowly blink 6 time upon the geolocation
complete event.

\{06,02,65,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00\}

Only the slice 1 is used and configured with:

-   **ext/cls** = 0x06
    -   System event class: 6 (Class geolocation)
    -   Pattern count extension: 0
    -   Inversion = 0
-   **type** = 0x02. System event type: geolocation complete
-   **Pattern** = 0x65
    -   Pattern identifier: 5 (blink slow)
    -   Pattern count = 6

Number of times the pattern is played (taking into account the
extension): 6

Sequence duration = 6 \* 2s = 12 seconds.

***Example 2***

The LED 0 and LED 1 are configured to blink 18 times alternatively upon
the button 2 press.

*LED 0*

\{21,00,26,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00\}

Only the slice 1 is used and configured with:

-   **ext/cls** = 0x21
    -   System event class: 1 (Class button 1)
    -   Pattern count extension: 1 (bit 5 set)
    -   Inversion = 0
-   **type** = 0x00. System event type: button press
-   **Pattern** = 0x26.
    -   Pattern identifier: 6 (blink medium)
    -   Pattern count = 16\*1 + 2. (16\*\<Pattern count MSB\> +
        \<Pattern Count LSB\>)

*LED 1*

\{A1,00,25,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00\}

Only the slice 1 is used and configured with:

-   **ext/cls** = 0xA1
    -   System event class: 1 (Class button 1)
    -   Pattern count extension: 1 (bit 5 set)
    -   Inversion = 1
-   **type** = 0x00. System event type: button press
-   **Pattern** = 0x25.
    -   Pattern identifier: 5 (blink medium)
    -   Pattern count = 2

Number of times the pattern is played (taking into account the
extension): 2 + 1\*16 + 0\*32 = 18

Sequence duration = 18 \* 1s = 18 seconds.

### Battery percentage display

On reception of the system event ***type_core_battery_level***, the
power manager calls a specific function of the LED manager, which will
display the remaining battery percentage on LED 0 (hard-coded):

-   4 blinks: Battery level above 75 % or battery in charge.
-   3 blinks: Battery level between 50% and 75%.
-   2 blinks: Battery level between 25% and 50%.
-   1 blink: Battery level below 25 %.

So there is no need to map the system event
***type_core_battery_level*** to the LED.

## Buzzer

### Overview

AT3 manages the buzzer as a melody player. Each melody has an
identifier, which can be associated to a given system event.

Note that in order to choose your favorite melody, a system CLI command
has been implemented to play them.

### Configuration

The configuration consists of a melody and a sequence. The sequence is
the number of time the melody will be played.

There is a single configuration parameter typed as byte array. The byte
array is split in 10 slices of 3 bytes each. Each slice configures a
melody for a system event.

The parameter is defined as:

<table>
  <tbody>
    <tr>
      <td colspan="3"><strong>Slice 1</strong></td>
      <td colspan="3"><strong>Slice 2</strong></td>
      <td><strong>...</strong></td>
      <td colspan="3"><strong>Slice 10</strong></td>
    </tr>
    <tr>
      <td>Byte 0</td>
      <td>Byte 1</td>
      <td>Byte 2</td>
      <td>Byte 0</td>
      <td>Byte 1</td>
      <td>Byte 2</td>
      <td></td>
      <td>Byte 0</td>
      <td>Byte 1</td>
      <td>Byte 2</td>
    </tr>
    <tr>
      <td>ext/cls</td>
      <td>type</td>
      <td>melody</td>
      <td>ext/cls</td>
      <td>type</td>
      <td>melody</td>
      <td></td>
      <td>ext/cls</td>
      <td>type</td>
      <td>melody</td>
    </tr>
  </tbody>
</table>

*Where*

-   **ext/cls:** Melody extension and system event class.
    -   bit 0..4: System event class. Refer to the [Event manager](./event-manager)
        section.
    -   bit 5..7: Melody count extension (Most significant bits).
-   **type**: System event type. Refer to the [Event manager](./event-manager) section.
-   **melody**: Melody configuration:
    -   bit 0..4. Melody identifier:
        -   0 -- None. No configured
        -   1 -- Melody 1: Off. Melody duration: Infinite
        -   2 -- Melody 2
        -   3 -- Melody 3
        -   4 -- Melody 4
    -   Bit 5..7. (Least significant bits): Number of times the pattern
        is displayed. Used in combination with the **Pattern count
        extension**. A combined value of 0 means infinite

***Notes***
-   To avoid confusion, while a melody is played it cannot be
    interrupted by another melody except the SOS or the melody OFF
    (***melody 1***).
-   If a slice maps the SOS start event, the associated melody will not
    be interrupted until the duration is complete or if the SOS stop
    event is received.
-   Note that the pattern melody Off (**melody 1**) won't stop the SOS.

***Examples***

Configure the buzzer to play melody 3 infinitely under the button 1
click event and stop on button 1 press:

\{00,02,03,00,00,01,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00\}

Configure the buzzer to play:
-   Infinitely the melody 7 on SOS (class 9, type 8)
-   The melody 6 played 10 times on button 2 click (class 1, type 2)
-   The melody 8 played 3 times on button 1 click (class 0. type 2)

\{09,08,07,21,02,46,00,02,68,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00,00\}
