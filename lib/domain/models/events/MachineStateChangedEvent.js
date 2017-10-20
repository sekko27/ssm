const Event = require('./Event');

class MachineStateChangedEvent extends Event {
    constructor(type, oldState, newState) {
        super(type);
        this._oldState = oldState;
        this._newState = newState;
    }

    get oldState() {
        return this._oldState;
    }

    get newState() {
        return this._newState;
    }
}

module.exports = MachineStateChangedEvent;

