const Event = require('./Event');

class BeforeTransitionEvent extends Event {
    constructor(type, state, event) {
        super(type);
        this._state = state;
        this._event = event;
    }

    get state() {
        return this._state;
    }

    get event() {
        return this._event;
    }
}

module.exports = BeforeTransitionEvent;