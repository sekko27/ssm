class StateNotFoundError extends Error {
    constructor(state) {
        super(`State not found: ${state}`);
        this._state = state;
    }

    get state() {
        return this._state;
    }
}

module.exports = StateNotFoundError;
