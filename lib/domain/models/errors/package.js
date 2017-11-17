const StateNotFoundError = require('./StateNotFoundError');
const TransitionNotFoundError = require('./TransitionNotFoundError');
const TransitionResultExpectedError = require('./TransitionResultExpectedError');
const TransitionInProcessError = require('./TransitionInProcessError');

module.exports = {
    get StateNotFound() {
        return StateNotFoundError;
    },
    get TransitionNotFound() {
        return TransitionNotFoundError;
    },
    get TransitionResultExpected() {
        return TransitionResultExpectedError;
    },
    get TransitionInProcess() {
        return TransitionInProcessError;
    }
};
