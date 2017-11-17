# ssm (Simple State Machine) module

## Introduction

The module provides basic functionality to create simple State Machines (with states and transitions) and manage their lifecycle.

It also provides builder implementations.

## Components

### State Machine

State machine consists of States and Transitions. State machine has an initial State and stores the current state.

State machine extends the EventEmitter and support the following events:

|Event|Constant|Description|
|-----|--------|-----------|
|machine state changed|EventFactory.MACHINE_STATE_CHANGED_NAME|After the transition has been successfully executed. It contains the oldState and the newState info.|
|transition failed|EventFactory.TRANSITION_FAILED_NAME|When the transition execution fails. It contains the current state, the event dispatched the transition and the error object.|

The state machine execution returns rejection on error when no event listener has been subscribed to the __transition failed__ event. Otherwise it emits the event.

### State

States are responsible to represents State Machine' states and executes transitions.

States are entities which means they are uniquely identified inside the state machine instance.

States have transitions point which are executions result a payload and a state identifier.

Exactly one State is the initial State inside the State Machine.

States extends EventEmitter:

|Event|Constant|Description|
|-----|--------|-----------|
|before transition|EventFactory.BEFORE_TRANSITION_NAME|Dispatched before execution.|
|after transition|EventFactory.AFTER_TRANSITION_NAME|Dispatched after successful execution.|

### Transition

Transition represents execution dispatched by an event.

The transitions have to response TransitionResult of Promise of TransitionResult instance or rejection.

The module provides the FunctionTransition Transition implementation to execute functions.


```javascript
const {
    TransitionResult,
    FunctionalTransition,
    Transition
} = require('sssm');

const transition1 = new FunctionalTransition(() => new TransitionResult('state-2', {/* payload */}));
const transition2 = new FunctionalTransition(() => Promise.delay(1000).return(new TransitionResult('state-2', {/* payload */}));
const transition3 = new FunctionalTransition(() => Promise.reject(new Error('some error')));
```

### Builders

The module exposes the builders.Machine interface to build State machines.

Example:

```javascript
const {builders:{Machine}} = require('sssm');

const machine = Machine()
    .state('s1', true) // State with id 's1' and it's the initial state
        .transition('m-1-2', new FunctionalTransition(() => new TransitionResult('s2', 'ping')))
        .on('after transition', e => console.log(e.result.payload))
        .add
    .state('s2') // State with id 's2' not initial
        .transition('m-2-1', new FunctionalTransition(() => new TransitionResult('s1', 'pong')))
        .transition('m-2-end', new FunctionalTransition(() => new TransitionResult('end', 'finishing')))
        .on('after transition', e => console.log(e.result.payload))
        .add
    .state('end').add
    .on('transition failed', e => console.error('puff'))
    .build;

machine.execute('m-1-2')
    .then(() => Promise.delay(500))
    .then(() => machine.execute('m-2-1'))
    .then(() => Promise.delay(500))
    .then(() => machine.execute('m-1-2'))
    .then(() => Promise.delay(500))
    .then(() => machine.execute('m-2-end'))
    .then(() => assert(machine.currentStateName === 'end'));

```