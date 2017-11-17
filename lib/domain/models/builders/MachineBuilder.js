const _ = require('lodash');
const assert = require('assert');
const StateBuilder = require('./StateBuilder');
const State = require('../State');
const Machine = require('../Machine');
const P = require('bluebird');
const {TRANSITION_FAILED_NAME, MACHINE_STATE_CHANGED_NAME} = require('../events/EventFactory');
const MACHINE_EVENTS = [TRANSITION_FAILED_NAME, MACHINE_STATE_CHANGED_NAME];

module.exports = function(Promise = P) {
    const context = {
        initial: null,
        states: new Map()
    };

    const listeners = [];
    const machineBuilder = {
        state(id, initial = false) {
            return StateBuilder(id, Promise, (state) => {
                assert(state instanceof State, 'State expected');
                assert(!context.states.has(state.id), `Duplicated state id: ${state.id}`);
                context.states.set(state.id, state);
                if (context.initial === null || initial === true) {
                    context.initial = state;
                }
                return machineBuilder;
            });
        },
        on(event, listener) {
            assert(_.indexOf(MACHINE_EVENTS, event) > -1, `Unsupported machine event: ${event}`);
            assert(_.isFunction(listener), 'Machine event listener has to be a function');
            listeners.push([event, listener]);
            return machineBuilder;
        },
        build() {
            assert(!_.isNull(context.initial), 'Initial state has not been defined (which means no state has been defined too)');
            /** @type {Machine|EventEmitter} machine */
            const machine = new Machine(Array.from(context.states.values()), context.initial, P);
            _.forEach(listeners, ([event, listener]) => machine.on(event, listener));
            return machine;
        }
    };
    return machineBuilder;
};
