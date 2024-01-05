// TouchPad On Off (c) 2024 Romano Giannetti <romano.giannetti@gmail.com>
// License: GPLv2+, see http://www.gnu.org/licenses/gpl-2.0.txt
//
import Gio from 'gi://Gio';
import Adw from 'gi://Adw';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class SwitchFocusTypePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: 'General',
            icon_name: 'dialog-information-symbolic',
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: 'Behavior',
            description: 'Configure the behavior of the extension',
        });
        page.add(group);

        // Create a new preferences row
        const rowNotification = new Adw.SwitchRow({
            title: 'Show Notifications',
            subtitle: 'Whether to show a notification on change',
        });
        group.add(rowNotification);

        const rowActivate = new Adw.SwitchRow({
            title: 'Enable the touchpad at login',
            subtitle: 'Avoid getting stuck with no pointing device',
        });
        group.add(rowActivate);

        const rowIcons = new Adw.SwitchRow({
            title: 'Use color icons',
            subtitle: 'Use color icons for OFF/ON',
        });
        group.add(rowIcons);
        //
        window._settings = this.getSettings();
        window._settings.bind('show-notifications', rowNotification, 'active',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('enable-on-login', rowActivate, 'active',
            Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('use-color-icons', rowIcons, 'active',
            Gio.SettingsBindFlags.DEFAULT);
    }
}
