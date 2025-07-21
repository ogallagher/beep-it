# Beep It

Beep It starts with a core concept— have a set of widgets on a board/console that the player must do in the correct order at increasing speed— and takes it to the next level. Namely, it supports **multiple devices** per game, and is highly **configurable**.

# Join a game

When visiting the site, each client device/browser is assigned a game `id` and `deviceId`. These are visible in the web address search query.

`https://` `subd.domain.tld` `?` id=**g1** `&` deviceId=**amber**

If you leave the site and return relatively soon (see game delete delay) with the same game `id`, your configuration should be restored.
To invite other player devices to join, you can tap the share button and copy the link. It omits `deviceId`.

# Local device keyboard type

The page will attempt to automatically determine whether the local client device has a physical keyboard, and update the corresponding button in the game controls bar. You can manually update the keyboard type using the same button.

<img alt="physical keyboard" src="doc/game-controls_device-feature_keyboard.png" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Use a physical keyboard.

<br style="clear: right;" />

<img alt="touch screen keyboard" src="doc/game-controls_device-feature_keytouch.png" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Use a touch screen keyboard.

<br style="clear: right" />

# Manage devices

<img alt="device manager" src="doc/game-controls_devices.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Next in the same game controls bar is the device count. Alongside it is a button to open the device manager, where you can remove/kick player devices from the game, including yourself.

The device ids are in the first column, then customizable aliases, and remove buttons.

<img alt="rejoin button" src="doc/game-controls_rejoin.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

When your device is removed or loses connection, the reconnect/plug button appears near the end of the game controls bar. 
Tap it to rejoin/reconnect.

<br style="clear: left" />

# Configure the game

## Set player count

Next in the game controls bar is the player count. This is separate from the device list because the number of people playing can be independent of the number of devices we’re using. Beep It does not yet use player count.

## Set board display mode

<img alt="board display mode = mirror" src="doc/game-controls_mirror.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Board display mode controls whether the client devices each see the same widgets (**mirror**),

<br style="clear: right;" />

<img alt="board display mode = extend" src="doc/game-controls_extend.jpeg" style="display: block; float: right; clear: right; padding-left: 1em; padding-bottom: 1em;" />

or different widgets (**extend**). In extend mode, widgets are evenly distributed among the different device screens.

<br style="clear: right;" />

## Set turn mode

The turn mode determines whether players take turns (competitive; not yet supported) or not (collaborative).

## Add widgets

<img alt="open widgets drawer" src="doc/game-controls_widgets-drawer_open.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Next in the game controls bar is the widget menu button; tap it to open the widgets drawer. 

<img alt="close widgets drawer" src="doc/game-controls_widgets-drawer_close.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

Tap it again to close.

<br style="clear: left" />

This drawer is a view of all the types of widgets that are available to add to the board. See [widget types](#readme-widget-types) for an explanation of each. Each widget type in the drawer can be configured. Tap the widget control/icon to add it to the board (below drawer). 
Each widget instance can still be configured (with additional options) after addition to the board.

<img alt="quick random widget" src="doc/game-controls_random-widget.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

Tap the quick/random widget button to a add a randomized widget to the board.

<br style="clear: right" />

### Configure widgets

| attribute | description |
| --- | --- |
| `label` | At the top of the widget card is a text input to name the widget. It can be left blank. When the game gives players a command, this `label` is the object. |
| `color` | Widgets all default to a white foreground; use the color picker to change this. |
| `size` | If widgets are overflowing the device screen viewport, use this slider to shrink the widget’s icon. |
| `duration` | Amount of extra time given for a player to do this widget. |
| `command text` | When the game gives players a command, `command` is the verb. |
| `command audio` | Record audio in the browser with the microphone button (may not work on some devices), or upload an audio file. This audio will be played when the corresponding command is given. |

## Preview board

<img alt="preview board widgets" src="doc/game-controls_preview-yes.jpeg" style="display: block; float: right; padding-left: 1em; padding-bottom: 1em;" />

To hide most widget config controls in the board, tap the preview button near the end of the game controls bar.

<img alt="configure board widgets" src="doc/game-controls_preview-no.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

Tap it again to resume configuring widgets.

<br style="clear: left" />

# Play the game

Tap the play button near the end of the game controls bar to begin.

<img alt="close widgets drawer" src="doc/game-controls_play.jpeg" style="display: block; float: left; padding-right: 1em; padding-bottom: 1em;" />

The game will emit a command and wait for a player device to do the corresponding widget action. If the wrong widget is done, or none are done quickly enough, the game ends. If the right widget is done, then score increments and the next command is emitted.

<br style="clear: left" />

<h1 id="readme-widget-types">Widget types</h1>

<img alt="button" src="public/widgetIcon/button.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Button**

Action is mouse click or tap.

<br style="clear: right" />
<img alt="knob" src="public/widgetIcon/twist.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Knob / Twist**

Action is to drag in a circle. Technically, the drag must pass through 3/4 quadrants.

<br style="clear: right" />
<img alt="lever" src="public/widgetIcon/lever.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Lever**

Action is to drag in the corresponding direction.

The configurable `direction` is one of four cardinal directions in which to pull it. 
Specify with the first letter of `U`p, `D`own, `L`eft, or `R`ight.

<br style="clear: right" />
<img alt="key" src="public/widgetIcon/key.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Key**

Action is to press the corresponding keyboard key. This is only compatible with devices that have peripheral keyboards (generally not mobile).

The configurable `key` to press is case sensitive and should support any printable character, even if the physical source keyboard requires a combination of keys to press it.

<br style="clear: right" />
<img alt="wait" src="public/widgetIcon/wait.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Wait**

Action is to do nothing.

<br style="clear: right" />
<img alt="path" src="public/widgetIcon/path.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Path**

Action is to trace the single connected path, starting from either endpoint.

The configurable `path` to trace is in [`svg.path.d` string format](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/d). Define it by dragging in the widget's control graphic area. The text input provides access to manually edit the control points. Their coordinates are expressed in the icon's source viewport space (90x90).

<br style="clear: right" />
<img alt="path" src="doc/widget-icon_keypad.svg" style="float: right; padding-left: 1em; padding-bottom: 1em; width: 10em;" />

**Keypad**

Action is to type a key combination/phrase, configurable with `text`. As with **key**, this is only compatible with devices that have peripheral keyboards (generally not mobile).