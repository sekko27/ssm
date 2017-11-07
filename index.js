module.exports = {
    State: require('./lib/domain/models/State'),
    Machine: require('./lib/domain/models/Machine'),
    Transition: require('./lib/domain/models/Transition'),
    TransitionResult: require('./lib/domain/models/TransitionResult'),
    FunctionalTransition: require('./lib/domain/models/FunctionalTransition'),
    errors: require('./lib/domain/models/errors/package'),
    events: require('./lib/domain/models/events/EventFactory'),
    builders: {
        Machine: require('./lib/domain/models/builders/MachineBuilder'),
        State: require('./lib/domain/models/builders/StateBuilder')
    }
};
