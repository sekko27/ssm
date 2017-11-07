const _ = require('lodash');
const assert = require('assert');
const {EventEmitter} = require('events');

const State = require('./State');
const EventFactory = require('./events/EventFactory');
const {StateNotFound} = require('./errors/package');

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

        return this._current.process(event)
            .then((result) => {
                const currentRef = this._current;
                return this.findState(result.state)
                    .then((newState) => {
                        this._current = newState;
                        this.dispatch(EventFactory.machineStateChanged(currentRef, this._current));
                        return result.payload;
                    });
            })
            .catch((err) => {
                if (!this.dispatch(EventFactory.transitionFailed(this._current, event, err))) {
                    return this.Promise.reject(err);
                }
            });
    }

    dispatch(event) {
        return this.emit(event.type, event);
    }

    findState(stateName) {
        const state = _.find(this._states, {id: stateName});
        return _.isUndefined(state)
            ? this.Promise.reject(new StateNotFound(stateName))
            : this.Promise.resolve(state);
    }

    possibleEventTypes() {
        return this._current.eventTypes();
    }

    get currentStateName() {
        return this._current.id;
    }
}

module.exports = Machine;