const EventFactory = require('./events/EventFactory');
const TransitionResult = require('./TransitionResult');
const TransitionNotFoundError = require('./TransitionNotFoundError');
const TransitionExpectedEvent = require('./TransitionExpectedError');
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
            return this.Promise.reject(new TransitionNotFoundError(this, event.type));
        }
        return this.dispatch(EventFactory.beforeTransition(this, event))
            .then(() => this.transitions.get(event.type).execute(event))
            .then((result) => {
                if (!(result instanceof TransitionResult)) {
                    return this.Promise.reject(new TransitionExpectedEvent(this, event, result));
                }
                return this.dispatch(EventFactory.afterTransition(this, event, result))
                    .then(() => result);
            });
    }

    dispatch(event) {
        return this.Promise.resolve(this.emit(event.type, event));
    }

    get eventNames() {
        return this.transitions.keys();
    }
}

module.exports = State;