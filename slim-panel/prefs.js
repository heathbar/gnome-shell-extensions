const Gtk = imports.gi.Gtk;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Config = imports.misc.config;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Keys = Me.imports.keys;

let settings;

function init() {
    Convenience.initTranslations();
    settings = Convenience.getSettings();
}

function buildPrefsWidget() {
    let frame = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL, border_width: 16, spacing: 16});

    frame.add(buildSpin('Width when in slim mode', [0, 4096, 1, 10, settings.get_int(Keys.SLIM_WIDTH)], (newValue) => settings.set_int(Keys.SLIM_WIDTH, newValue)));
    frame.add(buildSpin('Margin to the right of the panel', [0, 4096, 1, 10, settings.get_int(Keys.SLIM_MARGIN)], (newValue) => settings.set_int(Keys.SLIM_MARGIN, newValue)));
    frame.add(buildSwitcher('Expand the panel when in overview', settings.get_boolean(Keys.EXPAND_ON_OVERVIEW), (newValue) => settings.set_boolean(Keys.EXPAND_ON_OVERVIEW, newValue)));
	frame.show_all();

	return frame;
}

function buildSpin(labelText, values, onChange) {
	let [min, max, step, page, value] = values;
	let hbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });

	let label = new Gtk.Label({label: labelText, xalign: 0 });

	let spin = new Gtk.SpinButton();
	spin.set_range(min, max);
	spin.set_increments(step, page);
	spin.set_value(value);

    spin.connect('value-changed', (widget) => onChange(widget.get_value()));
    
	hbox.pack_start(label, true, true, 0);
	hbox.add(spin);

	return hbox;
};

function buildSwitcher(labelText, value, onChange) {
	let hbox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, spacing: 10 });

	let label = new Gtk.Label({label: labelText, xalign: 0 });
	let switcher = new Gtk.Switch({active: true});

	switcher.connect('notify::active', (widget) => onChange(widget.active));

	hbox.pack_start(label, true, true, 0);
	hbox.add(switcher);

	return hbox;
}
