class TransitionResultExpectedError extends Error {
    /**
     *
     * @param {State} state
     * @param {Event} event
     * @param result
     */
    constructor(state, event, result) {
        super(`TransitionResult instance is expected for transition result for ${state.id} on event ${event.type}`);
        this._state = state;
        this._event = event;
        this._result = result;
    }

    /**
     * @return {State}
     */
    get state() {
        return this._state;
    }

    /**
     * @return {Event}
     */
    get event() {
        return this._event;
    }

    get result() {
        return this._result;
    }
}

module.exports = TransitionResultExpectedError;