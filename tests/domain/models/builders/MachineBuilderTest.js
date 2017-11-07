const {builders: {Machine}} = require.main.require('index');

const chai = require('chai');
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
    it('shoould select the last explicitly defined initial state as initial', function() {
        assert.equal('test3', Machine().state('test1', true).add().state('test2', false).add().state('test3', true).add().machine().currentStateName);
    });
});