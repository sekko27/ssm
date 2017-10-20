const _ = require('lodash');
const assert = require('assert');
const {EventEmitter} = require('events');

const State = require('./State');
const Transition = require('./Transition');
const EventFactory = require('./events/EventFactory');
const StateNotFoundError = require('./StateNotFoundError');
const DefaultPromise = require('bluebird');

class Machine extends EventEmitter {
    constructor(states, current, Promise) {
        super();

        assert(_.every(states, (s) => s instanceof State), 'States collection has to contain State instances only');
        assert(current instanceof State, 'Initial state has to be a State instance');

        this._states = states;
        this._current = current;
        this.Promise = Promise;
    }

    execute(event) {
        this._current.process(event)
            .then((result) => {
                const currentRef = this._current;
                return this.findState(result.state)
                    .then((newState) => {
                        this._current = newState;
                        this.emit(EventFactory.machineStateChanged(currentRef, this._current));
                        return result.payload;
                    });
            })
            .catch((err) => {
                this.emit(EventFactory.transitionFailed(this._current, event, err));
                return this.Promise.reject(err);
            });
    }

    findState(stateName) {
        const state = _.find(this._states, {id: stateName});
        return _.isUndefined(state)
            ? this.Promise.reject(new StateNotFoundError(stateName))
            : this.Promise.resolve(state);
    }
    currentStateName() {
        return this._current.id;
    }

    static builder(P = DefaultPromise) {
        const context = {
            states: new Map(),
            initial: null,
            first: null
        };

        const builder = {
            buildState(id, initial = false) {
                const transitions = new Map();
                const stateBuilder = {
                    transition(eventName, transition) {
                        assert(transition instanceof Transition, 'Transition instance expected');
                        assert(!transition.has(eventName), `Duplication transition in "${id}" state for "${eventName}" event`);
                        transitions.set(eventName, transition);
                        return stateBuilder;
                    },
                    add() {
                        return builder.state(new State(id, transitions, P), initial);
                    }
                };
                return stateBuilder;
            },
            state(state, initial = false) {
                assert(state instanceof State, 'State expected');
                assert(!context.states.has(state.id), `Duplicate state id: ${state.id}`);
                context.states.set(state.id, state);
                if (context.initial === null || initial) {
                    context.initial = state;
                }
                return builder;
            },
            machine() {
                assert(!_.isNull(context.initial), 'Initial state has not been defined (which means no state has been defined too)');
                return new Machine(Array.from(context.states.values()), context.initial, P);
            }
        };
        return builder;
    }
}

module.exports = Machine;