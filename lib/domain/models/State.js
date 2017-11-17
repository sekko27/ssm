const EventFactory = require('./events/EventFactory');
const TransitionResult = require('./TransitionResult');
const {TransitionNotFound, TransitionResultExpected} = require('./errors/package');
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
    }

    /**
     *
     * @param {Event} event
     * @return {*}
     */
    process(event) {
        if (!this.transitions.has(event.type)) {
            return this.Promise.reject(new TransitionNotFound(this, event.type));
        }
        return this.dispatch(EventFactory.beforeTransition(this, event))
            .then(() => this.transitions.get(event.type).execute(event))
            .then((result) => {
                return result instanceof TransitionResult
                    ? this.dispatch(EventFactory.afterTransition(this, event, result)).return(result)
                    : this.Promise.reject(new TransitionResultExpected(this, event, result));
            });
    }

    dispatch(event) {
        return this.Promise.resolve(this.emit(event.type, event));
    }

    get eventTypes() {
        return Array.from(this.transitions.keys());
    }
}

module.exports = State;