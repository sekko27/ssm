const BeforeTransitionEvent = require('./BeforeTransitionEvent');
const AfterTransitionEvent = require('./AfterTransitionEvent');
const MachineStateChangedEvent = require('./MachineStateChangedEvent');
const TransitionFailedEvent = require('./TransitionFailedEvent');

class EventFactory {
    static get BEFORE_TRANSITION_NAME() {
        return 'before transition';
    }

    static get AFTER_TRANSITION_NAME() {
        return 'after transition';
    }

    static get MACHINE_STATE_CHANGED_NAME() {
        return 'machine state changed';
    }

    static get TRANSITION_FAILED_NAME() {
        return 'transition failed';
    }

    static beforeTransition(state, event) {
        return new BeforeTransitionEvent(EventFactory.BEFORE_TRANSITION_NAME, state, event);
    }

    static afterTransition(state, event, result) {
        return new AfterTransitionEvent(EventFactory.AFTER_TRANSITION_NAME, state, event, result);
    }

    static machineStateChanged(oldState, newState) {
        return new MachineStateChangedEvent(EventFactory.MACHINE_STATE_CHANGED_NAME, oldState, newState);
    }

    static transitionFailed(state, event, error) {
        return new TransitionFailedEvent(EventFactory.TRANSITION_FAILED_NAME, state, event, error);
    }

}

module.exports = EventFactory;
