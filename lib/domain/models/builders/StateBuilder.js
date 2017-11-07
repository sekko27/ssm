const assert = require('assert');
const Transition = require('../Transition');
const State = require('../State');

module.exports = function(id, Promise, onEnd) {
    const transitions = new Map();
    const builder = {
        transition(eventName, transition) {
            assert(transition instanceof Transition, 'Transition instance expected');
            assert(!transitions.has(eventName), `Duplication transition in "${id}" state for "${eventName}" event`);
            transitions.set(eventName, transition);
            return builder;
        },
        add() {
            return onEnd(new State(id, transitions, Promise));
        }
    };
    return builder;
};