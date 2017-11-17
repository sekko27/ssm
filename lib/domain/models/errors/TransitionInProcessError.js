class TransitionInProcessError extends Error {
    constructor(state, inProcessTransition, event) {
        super('Transition in process');
        this._state = state;
        this._inProcessTransition = inProcessTransition;
        this._event = event;
    }

    get state() {
        return this._state;
    }

    get inProcessTransition() {
        return this._inProcessTransition;
    }

    get event() {
        return this._event;
    }
}

module.exports = TransitionInProcessError;
