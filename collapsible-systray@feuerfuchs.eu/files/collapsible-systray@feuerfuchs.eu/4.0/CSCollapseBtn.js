
let _;
if (typeof require !== 'undefined') {
    _               = require('./Util')._;
} else {
    const AppletDir = imports.ui.appletManager.applets['collapsible-systray@feuerfuchs.eu'];
    _               = AppletDir.Util._;
}

const Gio                                = imports.gi.Gio;
const St                                 = imports.gi.St;
const Tooltips                           = imports.ui.tooltips;
const Applet                             = imports.ui.applet;

const DEFAULT_PANEL_HEIGHT               = Applet.DEFAULT_PANEL_HEIGHT;
const PANEL_SYMBOLIC_ICON_DEFAULT_HEIGHT = Applet.PANEL_SYMBOLIC_ICON_DEFAULT_HEIGHT;

// ------------------------------------------------------------------------------------------------------

class CSCollapseBtn {
    constructor(applet) {
        this.State = {
            EXPANDED:    0,
            COLLAPSED:   1,
            UNAVAILABLE: 2
        };

        this._applet = applet;
        this.actor   = new St.Button({ reactive: true, track_hover: true, style_class: 'applet-box' });
        this.icon    = new St.Icon({ reactive: true, track_hover: true, style_class: 'applet-icon' });
        this.tooltip = new Tooltips.PanelItemTooltip(this, "", applet._orientation);

        this.actor.set_child(this.icon);
    }

    /*
     * Set the display mode to vertical
     */
    setVertical(vertical) {
        if (vertical) {
            this.actor.add_style_class_name('vertical');
        } else {
            this.actor.remove_style_class_name('vertical');
        }
    }

    /*
     * Set the icon using it's qualified name
     */
    setIcon(name) {
        this.icon.set_icon_name(name);
        this.icon.set_icon_type(St.IconType.SYMBOLIC);
        this._setStyle();
    }

    /*
     * Set the icon using a file path
     */
    setIconFile(iconFile) {
        try {
            this.icon.set_gicon(new Gio.FileIcon({ file: iconFile }));
            this.icon.set_icon_type(St.IconType.SYMBOLIC);
            this._setStyle();
        } catch (e) {
            global.log(e);
        }
    }

    /*
     *
     */
    _setStyle() {
        this.icon.set_icon_size(this._applet.icon_size);
        this.icon.set_style_class_name('system-status-icon');
    }

    /*
     *
     */
    refreshReactive() {
        //this.actor.set_reactive(this.state !== this.State.UNAVAILABLE && this._applet._draggable.inhibit);
        this.actor.set_reactive(this._applet._draggable.inhibit);
    }

    /*
     * Set expanded state and refresh the icon
     */
    setState(state) {
        this.state = state;

        this.refreshReactive();

        let iconName;
        switch (state) {
            case this.State.EXPANDED:
                iconName = this._applet.collapseIcon;
                this.icon.set_opacity(255);
                this.tooltip.set_text(_("Collapse"));
                break;

            case this.State.COLLAPSED:
                iconName = this._applet.expandIcon;
                this.icon.set_opacity(255);
                this.tooltip.set_text(_("Expand"));
                break;

            case this.State.UNAVAILABLE:
                iconName = "edit";
                this.icon.set_opacity(96);
                this.tooltip.set_text(_("No icons to hide/reveal"));
                break;
        }
        if (!iconName) {
            return;
        }

        let iconFile = Gio.File.new_for_path(iconName);
        if (iconFile.query_exists(null)) {
            this.setIconFile(iconFile);
        } else {
            this.setIcon(iconName);
        }
    }
}
