class TransitionNotFoundError extends Error {
    /**
     *
     * @param {State} state State instance.
     * @param {string} transition Transition name.
     */
    constructor(state, transition) {
        super(`Transition "${transition}" has not been found in "${state.id}" state`);
        this._state = state;
        this._transition = transition;
    }

    /**
     * @return {State}
     */
    get state() {
        return this._state;
    }

    /**
     *
     * @return {string}
     */
    get transition() {
        return this._transition;
    }
}

module.exports = TransitionNotFoundError;
