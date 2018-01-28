
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;

const ANIMATION_SPEED = 0.45;

const SlimPanel = function () {
    this.init();
};

SlimPanel.prototype = {
    init: function () {
        this.monitor = Main.layoutManager.primaryMonitor;
        this.actor = Main.panel.actor;
        this.box = this.actor.get_parent();
        this.originalX = this.box.get_x();
        this.originalY = this.box.get_y();
        this.height = this.actor.get_height();
        this.slimWidth = 700;
        this.slimX = this.monitor.width - this.slimWidth - 100;

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
    Main.panel._rightBox.insert_child_at_index(button, 0);
    
    // make the panel slim
    sp = new SlimPanel();

    // attach listeners to overview to grow/shrink accordingly
    expand_event = Main.overview.connect('showing', sp.expand.bind(sp));
    shrink_event = Main.overview.connect('hiding', sp.shrink.bind(sp));
}

function disable() {
    Main.panel._rightBox.remove_child(button);

    // remove any listeners
    if (expand_event) {
        Main.overview.disconnect(expand_event);
    }
    if (shrink_event) {
        Main.overview.disconnect(shrink_event);
    }

    // put all the pieces back; cleanup
    sp.destroy();
    sp = null;
}