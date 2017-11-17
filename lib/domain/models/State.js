const EventFactory = require('./events/EventFactory');
const TransitionResult = require('./TransitionResult');
const {TransitionNotFound, TransitionResultExpected, TransitionInProcess} = require('./errors/package');
const {EventEmitter} = require('events');

class State extends EventEmitter {
    /**
     *
     * @param id
     * @param {Map} transitions
     * @param Promise
     */
    constructor(id, transitions, Promise) {
        super();
        this.id = id;
        this.transitions = transitions;
        this.Promise = Promise;
        this._transitionInProcess = null;
    }

    /**
     *
     * @param {Event} event
     * @return {*}
     */
    process(event) {
        if (this._transitionInProcess !== null) {
            return this.Promise.reject(new TransitionInProcess(this, this._transitionInProcess, event));
        }
        if (!this.transitions.has(event.type)) {
            return this.Promise.reject(new TransitionNotFound(this, event.type));
        }
        this._transitionInProcess = this.transitions.get(event.type);

        return this.dispatch(EventFactory.beforeTransition(this, event))
            .then(() => this._transitionInProcess.execute(event))
            .then((result) => {
                return result instanceof TransitionResult
                    ? this.dispatch(EventFactory.afterTransition(this, event, result)).return(result)
                    : this.Promise.reject(new TransitionResultExpected(this, event, result));
            })
            .finally(() => this._transitionInProcess = null);
    }

    dispatch(event) {
        return this.Promise.resolve(this.emit(event.type, event));
    }

    get eventTypes() {
        return Array.from(this.transitions.keys());
    }
}

module.exports = State;