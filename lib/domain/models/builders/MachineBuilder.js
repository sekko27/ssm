const _ = require('lodash');
const assert = require('assert');
const StateBuilder = require('./StateBuilder');
const State = require('../State');
const Machine = require('../Machine');
const P = require('bluebird');

module.exports = function(Promise = P) {
    const context = {
        initial: null,
        states: new Map()
    };

    const machineBuilder = {
        state(id, initial = false) {
            return StateBuilder(id, Promise, (state) => {
                assert(state instanceof State, 'State expected');
                assert(!context.states.has(state.id), `Duplicated state id: ${state.id}`);
                context.states.set(state.id, state);
                if (context.initial === null || initial) {
                    context.initial = state;
                }
                return machineBuilder;
            });
        },
        machine() {
            assert(!_.isNull(context.initial), 'Initial state has not been defined (which means no state has been defined too)');
            return new Machine(Array.from(context.states.values()), context.initial, P);
        }
    };
    return machineBuilder;
};
