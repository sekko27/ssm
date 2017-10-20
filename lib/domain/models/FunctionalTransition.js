const Transition = require('./Transition');

class FunctionalTransition extends Transition {
    constructor(executor, Promise) {
        super(Promise);
        this.executor = executor;
    }

    execute(event) {
        return this.executor(event);
    }
}

module.exports = FunctionalTransition;