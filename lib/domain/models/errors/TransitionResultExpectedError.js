class TransitionResultExpectedError extends Error {
    constructor(state, event, result) {
        super(`TransitionResult instance is expected for transition result`);
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

module.exports = TransitionResultExpectedError;