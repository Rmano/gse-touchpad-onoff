# TouchPad On-Off

By Romano Giannetti <romano@rgtti.com> , <romano.giannetti@gmail.com>

### Rationale

Most laptops have a key combination (usually some Fn-*thing*) to enable/disable the touchpad.
But not all of them. My Lenovo Yoga L13, for example, doesn't have one.
This extension just enables/disables the touchpad;
by default, it restores the touchpad in the enabled state when you logout and login,
but you can choose just to remember the old state in the options.

### Features

Click (or tap with a touchscreen, [thanks to Lasse Yledahl](https://github.com/Rmano/gse-touchpad-onoff/pull/3)) on the icon to change from Touchpad On to Off.

Each click toggle the status.

### Options

* You can choose to have a notification for each change of status or not.
(default yes)
* You can choose if the touchpad starts enabled after login (default yes) or if it remembers the last value.
* You can opt for more colorful icons if you do not like the standard ones (contributed by [@corebots](https://github.com/Rmano/gse-touchpad-onoff/issues/1)).

![screenshot](screenshot.png)

### I'm stuck!

If you are stuck without mouse or touchpad, open a terminal window
or the command prompt of gnome-shell (with Alt-F2) and issue

    dconf write /org/gnome/desktop/peripherals/touchpad/send-events true

...and you'll have your touchpad back.

### Notice for versions from 10 upward (GnomeShell 51 and up)

The versions from 10 upward are **only** for Gnome-Shell 51 or higher.

* There have been a complete rewrite to follow the [deprecations of interfaces](https://gjs.guide/extensions/upgrading/gnome-shell-51.html#clutter-controllers) that happened there and to use the [new button and connectors interfaces](https://gjs.guide/extensions/upgrading/gnome-shell-51.html#clutter-controllers).

