const {
    builders: {Machine},
    errors: {TransitionNotFound, TransitionResultExpected, TransitionInProcess},
    FunctionalTransition,
    TransitionResult,
    events
} = require.main.require('index');

const Promise = require('bluebird');
const chai = require('chai');
const cap = require('chai-as-promised');
const cs = require('chai-spies');
chai.use(cap);
chai.use(cs);
chai.should();

/**
 * @type {{property,isFunction,throws,equal,sameMembers}} assert
 */
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
        assert.isDefined(Object.getOwnPropertyDescriptor(builder, 'build'));
    });

    it('should expose transition builder inside state builder', function() {
        const stateBuilder = Machine().state('test', true);
        assert.property(stateBuilder, 'transition');
        assert.isFunction(stateBuilder.transition);
    });

    it('should expose add (finalizer) builder inside state builder', function() {
        const stateBuilder = Machine().state('test', true);
        assert.isDefined(Object.getOwnPropertyDescriptor(stateBuilder, 'add'));
    });

    it('should throws AssertionError on duplicating state id', function() {
        assert.throws(function() {
            Machine().state('test').add.state('test').add.build;
        }, AssertionError, /Duplicated state id/);
    });

    it('should select the first as initial when no initial explicitly defined', function() {
        assert.equal('test1', Machine().state('test1').add.state('test2').add.build.currentStateName);
    });

    it('should select the explicitly defined initial state as initial', function() {
        assert.equal('test2', Machine().state('test1').add.state('test2', true).add.build.currentStateName);
    });

    it('should select the last explicitly defined initial state as initial', function() {
        assert.equal('test3', Machine().state('test1', true).add.state('test2', false).add.state('test3', true).add.build.currentStateName);
    });

    it('should throws AssertionError on duplicate transition on same state', function() {
        assert.throws(function() {
            Machine().state('test')
                .transition('e', new FunctionalTransition(()=>{}))
                .transition('e', new FunctionalTransition(()=>{}))
                .add.build;
        }, AssertionError, /Duplication transition/);
    });

    it('should throws TransitionNotFound on non-existing transition', function() {
        return Machine().state('test1', true).add.state('test2').add.build.execute({type:'move'}).should.be.rejectedWith(TransitionNotFound);
    });

    // TODO Extract
    it('should move the current pointer on execution', function() {
        const m = Machine().state('test1', true).transition('move', new FunctionalTransition(() => {
            return new TransitionResult('test2', null);
        })).add.state('test2').add.build;
        return m.execute({type: 'move'}).then(() => m.currentStateName).should.become('test2');
    });

    // TODO Extract
    it('should emit event on state change', function() {
        const m = Machine().state('test1', true).transition('move', new FunctionalTransition(()=> {
            return new TransitionResult('test2', null);
        })).add.state('test2').add.build;
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
        })).add.build.execute({type: 'move'}).should.be.rejectedWith(Error, /^abc$/);
    });

    // TODO Extract
    it('should emit event on transition rejection', function() {
        const m = Machine().state('test1', true).transition('move', new FunctionalTransition(() => {
            return Promise.reject(new Error('abc'));
        })).add.build;
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
                .add
            .state('test2')
                .transition('move2-3', new FunctionalTransition(() => new TransitionResult('test3', null)))
                .add
            .state('test3')
                .transition('move3-1', new FunctionalTransition(() => new TransitionResult('test1', null)))
                .add
            .build;
        assert.sameMembers(m.possibleEventTypes, ['move1-2', 'move1-3']);
        return m.execute({type:'move1-2'})
            .then(() => {
                assert.sameMembers(m.possibleEventTypes, ['move2-3']);
                return m.execute({type:'move2-3'});
            })
            .then(() => {
                assert.sameMembers(m.possibleEventTypes, ['move3-1']);
            });
    });
    it('should support "before transition" event" listening', function() {
        let result = null;
        const onBeforeTransition = chai.spy((e) => result = e);
        const m = Machine()
            .state('s1', true)
                .transition('m1-2', new FunctionalTransition(() => new TransitionResult('s2', null)))
                .on('before transition', onBeforeTransition)
                .add
            .state('s2', false).add
            .build;
        return m.execute({type:'m1-2'})
            .then(() => onBeforeTransition.should.have.been.called.once)
            .then(() => assert.deepEqual({state: result.state.id, event: result.event.type}, {state: 's1', event: 'm1-2'}));
    });
    it('should support "after transition" event listening', function() {
        let result = null;
        const onAfterTransition = chai.spy((e) => result = e);
        const m = Machine()
            .state('s1', true)
            .transition('m1-2', new FunctionalTransition(() => new TransitionResult('s2', 'result-value')))
            .on('after transition', onAfterTransition)
            .add
            .state('s2', false).add
            .build;
        return m.execute({type:'m1-2'})
            .then(() => onAfterTransition.should.have.been.called.once)
            .then(() => assert.deepEqual(
                {state: result.state.id, event: result.event.type, result: {payload: result.result.payload, state: result.result.state}},
                {state: 's1', event: 'm1-2', result: {payload: 'result-value', state: 's2'}}
            ));;
    });
    it('should support "transition failed" event listening (it should be fulfilled when an event listener subscribed to it)', function() {
        let result = null;
        const onFailed = chai.spy((e) => result = e);
        const m = Machine()
            .state('s1', true)
            .transition('m1-2', new FunctionalTransition(() => Promise.reject('test error')))
            .add
            .state('s2', false).add
            .on('transition failed', onFailed)
            .build;
        return m.execute({type: 'm1-2'}).should.be.fulfilled
            .then(() => onFailed.should.have.been.called.once)
            .then(() => assert.deepEqual(
                {state: result.state.id, event: result.event.type, error: result.error},
                {state: 's1', event: 'm1-2', error: 'test error'}
            ));
    });
    it('should support "transition failed" event listening (it should be reject when no event listener subscribed to it)', function() {
        const m = Machine()
            .state('s1', true)
            .transition('m1-2', new FunctionalTransition(() => Promise.reject('test error')))
            .add
            .state('s2', false).add
            .build;
        return m.execute({type: 'm1-2'}).should.be.rejectedWith('test error');
    });
    it('should support "machine state changed" event listening', function() {
        let result = null;
        const onChange = chai.spy((e) => result = e);
        const m = Machine()
            .state('s1', true)
            .transition('m1-2', new FunctionalTransition(() => new TransitionResult('s2', null)))
            .add
            .state('s2', false).add
            .on('machine state changed', onChange)
            .build;
        return m.execute({type: 'm1-2'})
            .should.be.fulfilled
            .then(() => onChange.should.have.been.called.once)
            .then(() => assert.deepEqual(
                {oldState: result.oldState.id, newState: result.newState.id},
                {oldState: 's1', newState: 's2'}
            ));
    });
    it('should be rejected on non-TransitionResult transition result', function() {
        const m = Machine()
            .state('s1', true)
            .transition('m1-2', new FunctionalTransition(() => 27))
            .add
            .state('s2', false).add
            .build;
        return m.execute({type: 'm1-2'}).should.be.rejectedWith(TransitionResultExpected);
    });

    it('should be rejected when executing event on in-progress state (running transition on it)', function() {
        const m = Machine()
            .state('s1', true)
                .transition('m1-2', new FunctionalTransition(() => Promise.delay(500, new TransitionResult('s2'))))
                .add
            .state('s2')
                .transition('m2-1', new FunctionalTransition(() => Promise.delay(500, new TransitionResult('s1'))))
                .add
            .build;
        m.execute({type: 'm1-2'});
        return Promise.delay(50).then(() => m.execute({type: 'm1-2'})).should.be.rejectedWith(TransitionInProcess);
    });

});