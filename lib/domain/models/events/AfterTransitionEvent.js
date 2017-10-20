const Event = require('./Event');

class AfterTransitionEvent extends Event {
    constructor(type, state, event, result) {
        super(type);
        this._state = state;
        this._event = event;
        this._result = result;
    }

    get state() {
        return this._state;
    }

    get event() {
        return this._event;
    }

    get result() {
        return this._result;
    }
}

module.exports = AfterTransitionEvent;