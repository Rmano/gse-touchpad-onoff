// Touchpad On Off extension (c) 2024-2026 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const MODE_ON = 'enabled';
const MODE_OFF = 'disabled';

export default class TouchpadOnOff extends Extension {
    constructor(metadata) {
        super(metadata);
        this._firstTime = true;
    }

    enable() {
        this._touchpadSettings = new Gio.Settings({
            schema: 'org.gnome.desktop.peripherals.touchpad',
        });
        this._settings = this.getSettings();

        // let use just one icon, we will change the content in _syncIcon()
        this._indicator = new PanelMenu.Button(0.0, this.metadata.name, true);
        this._icon = new St.Icon({style_class: 'system-status-icon'});
        this._indicator.add_child(this._icon);

        // Instead of using raw events, just use one "controller"
        // to handle both pointer clicks and touchscreen taps.
        // https://gjs.guide/extensions/upgrading/gnome-shell-51.html#clutter-controllers
        // The change was suggested in https://gjs.guide/extensions/upgrading/gnome-shell-51.html#clutter-controllers
        this._clickGesture = new Clutter.ClickGesture();
        this._clickGestureId = this._clickGesture.connect(
            'recognize', () => this._toggle());
        this._indicator.add_action(this._clickGesture);

        this._sendEventsId = this._touchpadSettings.connect(
            'changed::send-events', () => this._syncIcon());
        this._colorIconsId = this._settings.connect(
            'changed::use-color-icons', () => this._syncIcon());

        // Preserve the old login behavior in this API-only patch.
        if (this._firstTime &&
            this._settings.get_boolean('enable-on-login')) {
            this._touchpadSettings.set_string('send-events', MODE_ON);
            this._firstTime = false;
        }

        this._syncIcon();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._touchpadSettings.disconnect(this._sendEventsId);
        this._settings.disconnect(this._colorIconsId);
        this._clickGesture.disconnect(this._clickGestureId);
        this._indicator.remove_action(this._clickGesture);
        this._indicator.destroy();
        this._indicator = null;
        this._icon = null;
        this._clickGesture = null;
        this._touchpadSettings = null;
        this._settings = null;
    }

    _toggle() {
        const currentMode = this._touchpadSettings.get_string('send-events');
        const targetMode = currentMode === MODE_ON ? MODE_OFF : MODE_ON;

        if (this._settings.get_boolean('show-notifications')) {
            const message = targetMode === MODE_ON
                ? 'Switching touchpad on'
                : 'Switching touchpad off';
            Main.notify(this.metadata.name, message);
        }

        this._touchpadSettings.set_string('send-events', targetMode);
    }

    _syncIcon() {
        // build the name of the icons for the "flat" and "color" options
        // load the icon on sync
        const mode = this._touchpadSettings.get_string('send-events');
        const colorSuffix = this._settings.get_boolean('use-color-icons')
            ? '-color'
            : '';
        const iconStem = mode === MODE_ON ? 'touchpadon' : 'touchpadoff';

        // load the new icon. The old one will be deleted/GC automatically
        this._icon.gicon = Gio.icon_new_for_string(
            `${this.path}/icons/${iconStem}${colorSuffix}.svg`);
        this._indicator.accessible_name = mode === MODE_ON
            ? 'Touchpad: on'
            : 'Touchpad: off';
    }
}
