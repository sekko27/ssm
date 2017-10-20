class StateNotFoundError extends Error {
    constructor(stateName) {
        super(`State not found: ${stateName}`);
        this._stateName = stateName;
    }

    get stateName() {
        return this._stateName;
    }
}

module.exports = StateNotFoundError;
