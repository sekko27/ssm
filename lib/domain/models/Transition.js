class Transition {
    constructor(Promise) {
        this.Promise = Promise;
    }

    /**
     * @abstract
     *
     * @param event
     * @return {Promise.<*>}
     */
    execute(event) {
        return this.Promise.reject(new ReferenceError('Transition.execute is not implemented'));
    }

    static of(functionInterface) {

    }
}

module.exports = Transition;