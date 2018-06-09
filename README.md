<p align="center">
  <a href="https://github.com/philipp-spiess/react-recomponent/">
    <img alt="ReComponent" src="https://dzwonsemrish7.cloudfront.net/items/141C432F210p0Z1B421F/logo.png" width="372">
  </a>
</p>

<p align="center">
  Reason-style reducer components for React using ES6 classes.
</p>

<p align="center">
  <img alt="npm" src="https://img.shields.io/npm/v/react-recomponent.svg" />
  <a href="https://github.com/philipp-spiess/react-recomponent/blob/master/LICENSE.md">
    <img alt="GitHub license" src="https://img.shields.io/badge/license-MIT-blue.svg" />
  </a>
  <a href="https://travis-ci.org/philipp-spiess/react-recomponent">
    <img alt="Travis" src="https://img.shields.io/travis/philipp-spiess/react-recomponent.svg" />
  </a>
  <a href="https://codecov.io/github/philipp-spiess/react-recomponent">
    <img alt="Codecov" src="https://img.shields.io/codecov/c/github/philipp-spiess/react-recomponent.svg" />
  </a>
  <a href="https://twitter.com/acdlite/status/974390255393505280">
    <img alt="Blazing Fast" src="https://img.shields.io/badge/speed-blazing%20%F0%9F%94%A5-brightgreen.svg" />
  </a>
</p>

---

A number of solutions to manage state in React applications are based on the concept of "reducer" – a function that transforms the state of the application in response to actions. An example is the [Redux][] library and architectures like [Flux][]. 

Most recently this pattern was implemented in [ReasonReact][] as the built-in solution to manage local component state. Similarly to Redux, ReasonReact components implement a reducer and actions to trigger state changes. Stateful components are usually referred as "reducer component".

*ReComponent* borrows these ideas from ReasonReact and brings reducer components to the React ecosystem.

A reducer component is used like a regular, stateful, React component with the added twist that `setState` is not allowed. Instead, state is updated through a `reducer` which is triggered by sending actions to it.

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Advanced Usage](#advanced-usage)
  - [Side Effects](#side-effects)
  - [Handling Events](#handling-events)
  - [Manage State Across the Tree](#manage-state-across-the-tree)
  - [Flow](#flow)
- [API Reference](#api-reference)

## Installation

```
npm install react-recomponent --save
```

## Getting Started

To create a reducer component extend `ReComponent` from `react-recomponent` instead of `React.Component`.

With `ReComponent` state is usually initialized using the `initialState()` callback and can only be modified by sending actions to the `reducer()` function. To help with that, you can use `createSender()`. Take a look at a simple counter example:

```js
import React from "react";
import { ReComponent, Update } from "react-recomponent";

class Counter extends ReComponent {
  constructor() {
    super();
    this.handleClick = this.createSender("CLICK");
  }

  initialState(props) {
    return {
      count: 0
    };
  }

  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return Update({ count: state.count + 1 });
    }
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        You’ve clicked this {this.state.count} times(s)
      </button>
    );
  }
}
```

[![Edit ReComponent - Getting Started](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/zq0210299x)

The `Counter` component starts with an initial state of `{ count: 0 }`. Note that this state is in fact a regular React component state. To update it, we use a click action which we identify by its type `"CLICK"` (this is similar to the way actions are identified in Redux).

The `reducer` will receive this action and act accordingly. In our case, it will return an `Update()` effect with the modified state.

ReComponent comes with four different types of [effects](https://github.com/philipp-spiess/react-recomponent#effects):

- `NoUpdate()` signalize that nothing should happen.
- `Update(state)` update the state.
- `SideEffects(fn)` run an arbitrary function which has [side effect]s. Side effects may never be run directly inside the reducer. **A reducer should always be pure**: for the same action applied onto the same state, it should return the same effects. **This to avoid bugs when React will work asynchronously**.
- `UpdateWithSideEffects(state, fn)` both update the state and then trigger the side effect.

By intelligently using any of the four types above, it is possible to transition between states in one place and without the need to use `setState()` manually. This drastically simplifies our mental model since changes must always go through the reducer first.

## Advanced Usage

Now that we‘ve learned how to use reducer components with React, it‘s time to look into more advanced use cases to effectively handle state transitions across bigger portions of your app.

### Side Effects

We‘ve already said that ReComponent comes with four different types of [effects](https://github.com/philipp-spiess/react-recomponent#effects). This is necessary to effectively handle side effects by keeping your reducer pure – given the same state and action, it will always return the same effects.

The following example will demonstrate the four different types of effects and show you how to use them:

```js
import React from "react";
import {
  ReComponent,
  NoUpdate,
  Update,
  SideEffects,
  UpdateWithSideEffects
} from "react-recomponent";

class Counter extends ReComponent {
  constructor() {
    super();
    this.handleNoUpdate = this.createSender("NO_UPDATE");
    this.handleUpdate = this.createSender("UPDATE");
    this.handleSideEffects = this.createSender("SIDE_EFFECTS");
    this.handleUpdateWithSideEffects = this.createSender(
      "UPDATE_WITH_SIDE_EFFECTS"
    );
  }

  initialState(props) {
    return {
      count: 0
    };
  }

  reducer(action, state) {
    switch (action.type) {
      case "NO_UPDATE":
        return NoUpdate();
      case "UPDATE":
        return Update({ count: state.count + 1 });
      case "SIDE_EFFECTS":
        return SideEffects(() => console.log("This is a side effect"));
      case "UPDATE_WITH_SIDE_EFFECTS":
        return UpdateWithSideEffects({ count: state.count + 1 }, () =>
          console.log("This is another side effect")
        );
    }
  }

  render() {
    return (
      <React.Fragment>
        <button onClick={this.handleNoUpdate}>NoUpdate</button>
        <button onClick={this.handleUpdate}>Update</button>
        <button onClick={this.handleSideEffects}>SideEffects</button>
        <button onClick={this.handleUpdateWithSideEffects}>
          UpdateWithSideEffects
        </button>

        <div>The current counter is: {this.state.count}</div>
      </React.Fragment>
    );
  }
}
```

[![Edit ReComponent - Side Effects](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/5x4o7m8vxl)

### Handling Events

React uses a method called pooling to improve performance when emitting events (check out the guides on [`SyntheticEvent`](https://reactjs.org/docs/events.html) to learn more). Basically React recycles events once the callback is handled making any reference to them unavailable.

Since the reducer function always runs within the `setState()` callback provided by React, synthetic events will already be recycled by the time the reducer is invoked. To be able to access event properties, we recommend passing the required values explicitly. The following example will show the coordinates of the last mouse click. To have control over which properties are sent to the reducer, we‘re using `send` directly in this case:

```js
import React from "react";
import { ReComponent, Update } from "react-recomponent";

class Counter extends ReComponent {
  constructor() {
    super();
    this.handleClick = this.handleClick.bind(this);
  }

  initialState(props) {
    return { x: 0, y: 0 };
  }

  handleClick(event) {
    this.send({
      type: "CLICK",
      payload: {
        x: event.clientX,
        y: event.clientY
      }
    });
  }

  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return Update({
          x: action.payload.x,
          y: action.payload.y
        });
    }
  }

  render() {
    const { x, y } = this.state;

    const style = {
      width: "100vw",
      height: "100vh"
    };

    return (
      <div style={style} onClick={this.handleClick}>
        Last click at: {x}, {y}
      </div>
    );
  }
}
```

[![Edit ReComponent - Handling Events](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/8yxqzw23n2)

### Manage State Across the Tree

Often times we want to pass state properties to descendants that are too far deep in the application tree. In order to do so the components in between need to pass those properties to their respective children until we reach the desidered component. This pattern is usually called [prop drilling](https://blog.kentcdodds.com/prop-drilling-bb62e02cb691).

Fortunately, React 16.3.0 introduced a new API called [`createContext()`](https://reactjs.org/docs/context.html#reactcreatecontext) that we can use to solve this issue by using context to pass those properties directly to the target component.

```js
import React from "react";
import { ReComponent, Update } from "react-recomponent";

const { Provider, Consumer } = React.createContext();

class Counter extends React.Component {
  render() {
    return (
      <Consumer>
        {({ state, handleClick }) => (
          <button onClick={handleClick}>
            You’ve clicked this {state.count} times(s)
          </button>
        )}
      </Consumer>
    );
  }
}

class DeepTree extends React.Component {
  render() {
    return <Counter />;
  }
}

class Container extends ReComponent {
  constructor() {
    super();
    this.handleClick = this.createSender("CLICK");
  }

  initialState(props) {
    return {
      count: 0
    };
  }

  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return Update({ count: state.count + 1 });
    }
  }

  render() {
    return (
      <Provider value={{ state: this.state, handleClick: this.handleClick }}>
        <DeepTree />
      </Provider>
    );
  }
}
```

[![Edit ReComponent - Manage State Across the Tree](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/0q9l907m7p)

If you‘re having troubles understanding this example, I recommend the fantastic documentation written by the React team about [Context](https://reactjs.org/docs/context.html#reactcreatecontext).

### Flow

_[Flow][] is a static type checker for JavaScript. This section is only relevant for you if you‘re using Flow in your application._

ReComponent comes with first class Flow support built in. By default, a ReComponent will behave like a regular Component and will require props and state to be typed:

```js
import * as React from "react";
import { ReComponent, Update } from "react-recomponent";

type Props = {};
type State = { count: number };

class UntypedActionTypes extends ReComponent<Props, State> {
  handleClick = this.createSender("CLICK");

  initialState(props) {
    return {
      count: 0
    };
  }

  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return Update({ count: state.count + 1 });
      default:
        return NoUpdate();
    }
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        You’ve clicked this {this.state.count} times(s)
      </button>
    );
  }
}
```

Without specifying our action types any further, we will allow all `string` values. It is, however, recommended that we type all action types using a union of string literals. This will further tighten the type checks and will even allow [exhaustiveness testing] to verify that every action is indeed handled.

```js
import * as React from "react";
import { ReComponent, Update } from "react-recomponent";

type Props = {};
type State = { count: number };
type ActionTypes = "CLICK";

class TypedActionTypes extends ReComponent<Props, State, ActionTypes> {
  handleClick = this.createSender("CLICK");

  initialState(props) {
    return {
      count: 0
    };
  }

  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return Update({ count: state.count + 1 });
      default: {
        return NoUpdate();
      }
    }
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        You’ve clicked this {this.state.count} times(s)
      </button>
    );
  }
}
```

Check out the [type definition tests](https://github.com/philipp-spiess/react-recomponent/blob/master/type-definitions/__tests__/ReComponent.js) for an example on exhaustive checking.

**Known Limitations With Flow:**

- While it is possible to exhaustively type check the reducer, Flow will still require every branch to return an effect. This is why the above examples returns `NoUpdate()` even though the branch can never be reached.

## API Reference

### Classes

- `ReComponent`

  - `initialState(props): state`

    Initialize the state of the component based on its props.

  - `reducer(action, state): effect`

    Translates an action into an effect. This is the main place to update your component‘s state.

    **Note:** Reducers should never trigger side effects directly. Instead, return them as effects.

  - `send(action): void`

    Sends an action to the reducer. The action _must_ have a `type` property so the reducer can identify it.

  - `createSender(actionType): fn`

    Shorthand function to create a function that will send an action of the `actionType` type to the reducer.

    If the sender function is called with an argument (for example a React event), this will be available at the `payload` prop. This follows the [flux-standard-actions][] naming convention.

- `RePureComponent`
  - Same `ReComponent` but based on [`React.PureComponent`](https://reactjs.org/docs/react-api.html#reactpurecomponent) instead.

### Effects

- `NoUpdate()`

  Returning this effect will not cause the state to be updated.

- `Update(state)`

  Returning this effect will update the state. Internally, this will use `setState()` with an updater function.

- `SideEffects(fn)`

  Enqueues side effects to be run but will not update the component‘s state.

- `UpdateWithSideEffects(state, fn)`

  Updates the component‘s state and _then_ calls the side effect function.

## License

[MIT](https://github.com/philipp-spiess/react-recomponent/blob/master/README.md)

[redux]: https://github.com/reduxjs/redux
[reason]: https://reasonml.github.io/
[reasonreact]: https://reasonml.github.io/reason-react/docs/en/state-actions-reducer.html
[flux]: https://facebook.github.io/flux/
[side effect]: https://en.wikipedia.org/wiki/Side_effect_(computer_science)
[flow]: https://flow.org/en/
[exhaustiveness testing]: https://blog.jez.io/flow-exhaustiveness/
[flux-standard-actions]: https://github.com/redux-utilities/flux-standard-action
