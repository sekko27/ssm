module.exports = {
    Machine: require('./lib/domain/models/Machine'),
    Transition: require('./lib/domain/models/Transition'),
    TransitionResult: require('./lib/domain/models/TransitionResult'),
    FunctionalTransition: require('./lib/domain/models/FunctionalTransition'),
    errors: {
        StateNotFound: require('./lib/domain/models/errors/StateNotFoundError'),
        TransitionNotFound: require('./lib/domain/models/errors/TransitionNotFoundError'),
        TransitionResultExpected: require('./lib/domain/models/errors/TransitionResultExpectedError')
    },
    events: require('./lib/domain/models/events/EventFactory')
};
