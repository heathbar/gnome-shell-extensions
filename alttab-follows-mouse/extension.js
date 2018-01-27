/* -*- mode: js; js-basic-offset: 4; indent-tabs-mode: nil -*- */

const Clutter = imports.gi.Clutter;

const Main = imports.ui.main;
const SwitcherPopup = imports.ui.switcherPopup;

let injections = {};

function init(metadata) {
}


function enable() {
    // Save the original _allocate method for later
    injections['_allocate'] = SwitcherPopup.SwitcherPopup.prototype._allocate;

    // Override the default implementation of _allocate
    SwitcherPopup.SwitcherPopup.prototype._allocate = function(actor, box, flags) {

        // Cache the real value so we can restore it later
        let truePrimary = Main.layoutManager.primaryMonitor;

        // Temporarily replace primary monitor based on mouse position
        Main.layoutManager.primaryMonitor = Main.layoutManager.currentMonitor;

        // Call the original _allocate method
        injections['_allocate'].apply(this, arguments);

        // Restore the real primary monitor
        Main.layoutManager.primaryMonitor = truePrimary;
    };
}

function disable() {
    for (let prop in injections) {
        SwitcherPopup.SwitcherPopup.prototype[prop] = injections[prop];
    }
}
