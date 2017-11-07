const {
    builders: {Machine},
    errors: {TransitionNotFound},
    FunctionalTransition,
    TransitionResult,
    events
} = require.main.require('index');

const Promise = require('bluebird');
const chai = require('chai');
const cap = require('chai-as-promised');
chai.use(cap);
chai.should();

const {assert} = chai;
const {AssertionError} = require('assert');

describe('MachineBuilder', function() {
    it('should expose state builder method', function() {
        const builder = Machine();
        assert.property(builder, 'state');
        assert.isFunction(builder.state);
    });

    it('should expose machine builder (finalizer) method', function() {
        const builder = Machine();
        assert.property(builder, 'machine');
        assert.isFunction(builder.machine);
    });

    it('should expose transition builder inside state builder', function() {
        const stateBuilder = Machine().state('test', true);
        assert.property(stateBuilder, 'transition');
        assert.isFunction(stateBuilder.transition);
    });

    it('should expose add (finalizer) builder inside state builder', function() {
        const stateBuilder = Machine().state('test', true);
        assert.property(stateBuilder, 'add');
        assert.isFunction(stateBuilder.add);
    });

    it('should throws AssertionError on duplicating state id', function() {
        assert.throws(function() {
            Machine().state('test').add().state('test').add().machine();
        }, AssertionError, /Duplicated state id/);
    });

    it('should select the first as initial when no initial explicitly defined', function() {
        assert.equal('test1', Machine().state('test1').add().state('test2').add().machine().currentStateName);
    });

    it('should select the explicitly defined initial state as initial', function() {
        assert.equal('test2', Machine().state('test1').add().state('test2', true).add().machine().currentStateName);
    });

    it('should select the last explicitly defined initial state as initial', function() {
        assert.equal('test3', Machine().state('test1', true).add().state('test2', false).add().state('test3', true).add().machine().currentStateName);
    });

    it('should throws AssertionError on duplicate transition on same state', function() {
        assert.throws(function() {
            Machine().state('test')
                .transition('e', new FunctionalTransition(()=>{}))
                .transition('e', new FunctionalTransition(()=>{}))
                .add().machine();
        }, AssertionError, /Duplication transition/);
    });

    it('should throws TransitionNotFound on non-existing transition', function() {
        return Machine().state('test1', true).add().state('test2').add().machine().execute({type:'move'}).should.be.rejectedWith(TransitionNotFound);
    });

    // TODO Extract
    it('should move the current pointer on execution', function() {
        const m = Machine().state('test1', true).transition('move', new FunctionalTransition(() => {
            return new TransitionResult('test2', null);
        })).add().state('test2').add().machine();
        return m.execute({type: 'move'}).then(() => m.currentStateName).should.become('test2');
    });

    // TODO Extract
    it('should emit event on state change', function() {
        const m = Machine().state('test1', true).transition('move', new FunctionalTransition(()=> {
            return new TransitionResult('test2', null);
        })).add().state('test2').add().machine();
        return Promise.fromCallback((cb) => {
            m.on(events.MACHINE_STATE_CHANGED_NAME, (e) => {
                cb(null, e);
            });
            m.execute({type: 'move'});
        }).then((r) => ({old: r.oldState.id, new: r.newState.id})).should.become({old: 'test1', new: 'test2'});
    });

    // TODO Extract
    it('should be rejected on transition rejection (if no listener on error)', function() {
        return Machine().state('test1', true).transition('move', new FunctionalTransition(() => {
            return Promise.reject(new Error('abc'));
        })).add().machine().execute({type: 'move'}).should.be.rejectedWith(Error, /^abc$/);
    });

    // TODO Extract
    it('should emit event on transition rejection', function() {
        const m = Machine().state('test1', true).transition('move', new FunctionalTransition(() => {
            return Promise.reject(new Error('abc'));
        })).add().machine();
        return Promise.fromCallback((cb) => {
            m.on(events.TRANSITION_FAILED_NAME, (e) => {
                cb(null, e);
            });
            m.execute({type: 'move'});
        }).then((r) => ({state: r.state.id, event: r.event.type, error: r.error.message}))
            .should.become({state: 'test1', event: 'move', error: 'abc'});
    });
    it('should return proper possible event names', function() {
        const m = Machine()
            .state('test1', true)
                .transition('move1-2', new FunctionalTransition(() => new TransitionResult('test2', null)))
                .transition('move1-3', new FunctionalTransition(() => new TransitionResult('test3', null)))
                .add()
            .state('test2')
                .transition('move2-3', new FunctionalTransition(() => new TransitionResult('test3', null)))
                .add()
            .state('test3')
                .transition('move3-1', new FunctionalTransition(() => new TransitionResult('test1', null)))
                .add()
            .machine();
        assert.sameMembers(m.possibleEventTypes, ['move1-2', 'move1-3']);
        return m.execute({type:'move1-2'})
            .then(() => {
                assert.sameMembers(m.possibleEventTypes, ['move2-3']);
                return m.execute({type:'move2-3'});
            })
            .then(() => {
                assert.sameMembers(m.possibleEventTypes, ['move3-1']);
            });
    })
});