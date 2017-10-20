class TransitionNotFoundError extends Error {
    constructor(state, transition) {
        super(`Transition "${transition}" has not been found in "${state.id}" state`);
        this._state = state;
        this._transition = transition;
    }

    get state() {
        return this._state;
    }

    get transition() {
        return this._transition;
    }
}

module.exports = TransitionNotFoundError;
