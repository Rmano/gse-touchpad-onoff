// Touchpad On Off extension (c) 2024 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Clutter from 'gi://Clutter';
import St from 'gi://St';
import Gio from 'gi://Gio';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

let button, icon_on, icon_off, icon_color_on, icon_color_off, wm_prefs, my_prefs, path;

function _switch(obj, event) {
    let type=event.type()
    switch(type) {
        case Clutter.EventType.TOUCH_BEGIN:
        case Clutter.EventType.TOUCH_UPDATE:
        case Clutter.EventType.TOUCH_CANCEL:
            // Do not act on the event, just let it propagate
            return Clutter.EVENT_PROPAGATE
        case Clutter.EventType.TOUCH_END:
        case Clutter.EventType.BUTTON_PRESS:
            // These events are handled by the button, carry on
    }
    let what=wm_prefs.get_string('send-events');
    let pNotify=my_prefs.get_boolean('show-notifications');
    if (what == 'enabled') {
        if (pNotify) {
            Main.notify("Touchpad On Off", "Switching touchpad off");
        }
        // not needed, set by the callback
        // button.set_child(icon_off);
        wm_prefs.set_string('send-events', 'disabled');
    } else {
        if (pNotify) {
            Main.notify("Touchpad On Off", "Switchin touchpad on");
        }
        // not needed, set by the callback
        // button.set_child(icon_on);
        wm_prefs.set_string('send-events', 'enabled');
    }
    return Clutter.EVENT_STOP
}

function _sync() {
    let what=wm_prefs.get_string('send-events');
    let pColored=my_prefs.get_boolean('use-color-icons');
    if (pColored) {
        if (what == 'enabled') {
            button.set_child(icon_color_on);
        } else {
            button.set_child(icon_color_off);
        }
    } else {
        if (what == 'enabled') {
            button.set_child(icon_on);
        } else {
            button.set_child(icon_off);
        }
    }
}

export default class TouchpadOnOff extends Extension {
    constructor(metadata) {
        super(metadata);
        this._metadata = metadata;
        this._first_time = true;
    }
    enable() {
        button = new St.Bin({ style_class: 'panel-button',
            reactive: true,
            can_focus: true,
            track_hover: true });
        path = this._metadata.path;
        icon_on = new St.Icon({ style_class: 'system-status-icon'});
        icon_on.gicon = Gio.icon_new_for_string(path + '/icons/touchpadon.svg');
        icon_off = new St.Icon({ style_class: 'system-status-icon'});
        icon_off.gicon = Gio.icon_new_for_string(path + '/icons/touchpadoff.svg');
        icon_color_on = new St.Icon({ style_class: 'system-status-icon'});
        icon_color_on.gicon = Gio.icon_new_for_string(path + '/icons/touchpadon-color.svg');
        icon_color_off = new St.Icon({ style_class: 'system-status-icon'});
        icon_color_off.gicon = Gio.icon_new_for_string(path + '/icons/touchpadoff-color.svg');
        wm_prefs=new Gio.Settings({schema: 'org.gnome.desktop.peripherals.touchpad'});
        // get settings
        my_prefs= this.getSettings();
        // let activate the touchpad on login. Useful if you get stuck
        // without any pointing device!
        if (this._first_time) {
            let enable_on_login=my_prefs.get_boolean('enable-on-login');
            if (enable_on_login) {
                wm_prefs.set_string('send-events', 'enabled');
                this._first_time = false;
            }
        }
        this._buttonId = button.connect('button-press-event', _switch);
        this._touchId = button.connect('touch-event', _switch);
        this._sendId = wm_prefs.connect('changed::send-events', (s, k) => { _sync() });
        this._iconId = my_prefs.connect('changed::use-color-icons', (s, k) => { _sync() });
        // start with the current status --- sync icon
        _sync();
        Main.panel._rightBox.insert_child_at_index(button, 0);
    }
    disable() {
        button.disconnect(this._buttonId);
        button.disconnect(this._touchId);
        wm_prefs.disconnect(this._sendId);
        wm_prefs.disconnect(this._iconId);
        Main.panel._rightBox.remove_child(button);
        button?.destroy();
        button = null;
        wm_prefs = null;
        my_prefs = null;
        icon_on = null;
        icon_off = null;
        icon_color_on = null;
        icon_color_off = null;
        path = null;
    }
}

