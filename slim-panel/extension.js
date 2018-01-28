const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;
const Keys = Me.imports.keys;
const settings = Convenience.getSettings();
const ANIMATION_SPEED = 0.45;

const SlimPanel = function (settings) {
    this.init(settings);
};

SlimPanel.prototype = {
    init: function (settings) {
        this.monitor = Main.layoutManager.primaryMonitor;
        this.actor = Main.panel.actor;
        this.box = this.actor.get_parent();
        this.originalX = this.box.get_x();
        this.originalY = this.box.get_y();
        this.height = this.actor.get_height();
        this.slimWidth = settings.get_int(Keys.SLIM_WIDTH);
        this.slimX = this.monitor.width - this.slimWidth - settings.get_int(Keys.SLIM_MARGIN);
        
        // sign up for settings changes
        settings.connect("changed::" + Keys.SLIM_WIDTH, (settings, key) => {
            this.slimWidth = settings.get_int(key);
            this.slimX = this.monitor.width - this.slimWidth - settings.get_int(Keys.SLIM_MARGIN);
            this.shrink();
        });

        settings.connect("changed::" + Keys.SLIM_MARGIN, (settings, key) => {
            this.slimX = this.monitor.width - this.slimWidth - settings.get_int(Keys.SLIM_MARGIN);
            this.shrink();
        });
        
        // move the box up (offscreen), then translate down so struts are setup correctly
        this.box.set_position(this.originalX, this.originalY - this.height);
        Tweener.addTween(this.actor, { translation_y: this.height });

        this.shrink();
    },

    shrink: function () {
        Tweener.addTween(this.actor, {
            translation_x: this.slimX,
            time: ANIMATION_SPEED,
            onComplete: () => {
                this._clip();
            }
        });
        Tweener.addTween(this.box, {
            width: this.slimWidth,
            time: ANIMATION_SPEED
        });
    },
    expand: function (callback) {
        this._unClip();

        Tweener.addTween(this.actor, {
            translation_x: 0,
            time: ANIMATION_SPEED
        });
        Tweener.addTween(this.box, {
            width: this.monitor.width,
            time: ANIMATION_SPEED,
            onComplete: () => {
                if (typeof callback === 'function') {
                    callback();
                }
            }
        });
    },

    // the panel has weird edges that look terrible when the panel is slimmed so we clip them off
    _clip: function () {
        this.box.set_clip(this.slimX, this.box.height, this.box.width, this.box.height);
    },
    _unClip: function () {
        this.box.remove_clip();
    },

    destroy: function () {
        this.expand(() => {
            this.box.set_position(this.originalX, this.originalY);
            Tweener.addTween(this.actor, { translation_y: 0, translation_x: 0 });
        });
    }
};

function init() {}

let sp;
let expand_event = false;
let shrink_event = false;

function enable() {
    // make the panel slim
    sp = new SlimPanel(settings);

    // attach listeners to overview to grow/shrink accordingly
    if (settings.get_boolean(Keys.EXPAND_ON_OVERVIEW)) {
        addOverviewListeners(sp);
    }

    // listen for changes to EXPAND_ON_OVERVIEW preference and respond accordingly
    settings.connect("changed::" + Keys.EXPAND_ON_OVERVIEW, (settings, key) => {
        if (settings.get_boolean(key)) {
            addOverviewListeners(sp);
        } else {
            removeOverviewListeners();
        }
    });
}

function disable() {
    removeOverviewListeners();

    // put all the pieces back; cleanup
    sp.destroy();
    sp = null;
}


function addOverviewListeners(panel) {
    expand_event = Main.overview.connect('showing', panel.expand.bind(sp));
    shrink_event = Main.overview.connect('hiding', panel.shrink.bind(sp));
}

function removeOverviewListeners() {
    if (expand_event) {
        Main.overview.disconnect(expand_event);
    }
    if (shrink_event) {
        Main.overview.disconnect(shrink_event);
    }
}