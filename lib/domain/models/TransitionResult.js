class TransitionResult {
    constructor(state, payload) {
        this._state = state;
        this._payload = payload;
    }

    get state() {
        return this._state;
    }

    get payload() {
        return this._payload;
    }
}

module.exports = TransitionResult;
