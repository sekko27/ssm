const Event = require('./Event');

class TransitionFailedEvent extends Event {
    constructor(type, state, event, error) {
        super(type);
        this._state = state;
        this._event = event;
        this._error = error;
    }

    get state() {
        return this._state;
    }

    get event() {
        return this._event;
    }

    get error() {
        return this._error;
    }

}

module.exports = TransitionFailedEvent;
