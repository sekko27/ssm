const _ = require('lodash');
const assert = require('assert');
const Transition = require('../Transition');
const State = require('../State');
const {
    BEFORE_TRANSITION_NAME,
    AFTER_TRANSITION_NAME,
    TRANSITION_FAILED_NAME
} = require('../events/EventFactory');

const STATE_EVENTS = [BEFORE_TRANSITION_NAME, AFTER_TRANSITION_NAME];

module.exports = function(id, Promise, onEnd) {
    const transitions = new Map();
    const listeners = [];

    const builder = {
        transition(eventName, transition) {
            assert(transition instanceof Transition, 'Transition instance expected');
            assert(!transitions.has(eventName), `Duplication transition in "${id}" state for "${eventName}" event`);
            transitions.set(eventName, transition);
            return builder;
        },
        on(type, listener) {
            assert(_.indexOf(STATE_EVENTS, type) > -1, `Invalid transition event to listen: ${type}`);
            assert(_.isFunction(listener), 'Transition event listener has to be a function');
            listeners.push([type, listener]);
            return builder;
        },
        get add() {
            /** @type {EventEmitter|State} state */
            const state = new State(id, transitions, Promise);
            _.forEach(listeners, ([type, listener]) => state.on(type, listener))
            return onEnd(state);
        }
    };
    return builder;
};