import React from "react";

import { isImmutable } from "./isImmutable";

const NO_UPDATE = 0;
const UPDATE = 1;
const SIDE_EFFECTS = 2;
const UPDATE_WITH_SIDE_EFFECTS = 3;

export function NoUpdate() {
  return {
    type: NO_UPDATE
  };
}

export function Update(state) {
  return {
    type: UPDATE,
    state
  };
}

export function SideEffects(sideEffects) {
  return {
    type: SIDE_EFFECTS,
    sideEffects
  };
}

export function UpdateWithSideEffects(state, sideEffects) {
  return {
    type: UPDATE_WITH_SIDE_EFFECTS,
    state,
    sideEffects
  };
}

export class ReComponent extends React.Component {
  constructor(props) {
    super(props);

    if (__DEV__) {
      if (typeof this.reducer !== "function") {
        const name = this.constructor.name || this.displayName;
        throw new Error(
          name +
            "(...): No `reducer` method found on the returned component " +
            "instance: did you define a reducer?"
        );
      }
    }

    // We might overwrite setState later for the Immutable.js helpers, thus we
    // keep a reference to the original method around as well.
    const originalSetState = this.setState;
    let setState = this.setState;

    if (__DEV__) {
      this.setState = () => {
        const name = this.constructor.name || this.displayName;
        throw new Error(
          name +
            "(...): Calls to `setState` are not allowed. Please use the " +
            "`reducer` method to update the component state"
        );
      };
    }

    // Initialize the component state based on the return value. Note that
    // when `Component#initialState` is not defined, we can still set the
    // state like any regular Component in the constructor.
    if (typeof this.initialState === "function") {
      let initialState = this.initialState(props);

      // When using ReComponent in combination with Immutable.js to manage the
      // state, we define a couple of helper methods to make it work as a
      // regular Component state must always be a plain JavaScript object.
      //
      // To emulate an Immutable.js object, we use a JavaScript object
      // consisting of only one key: `immutableState`. To make the render method
      // easier, we also expose `Component#immutableState` to access the
      // components state since we don't want to overwrite `Component#state`.
      //
      // We only opt-into this behavior when `Component#initialState` returns an
      // Immutable.js object.
      if (isImmutable(initialState)) {
        initialState = { immutableState: initialState };
        setState = (updater, callback) => {
          originalSetState.call(
            this,
            (state, props) => ({
              immutableState: updater(state.immutableState, props)
            }),
            callback
          );
        };
        Object.defineProperty(this, "immutableState", {
          get: () => this.state.immutableState
        });
      }

      this.state = initialState;
    }

    // Sends an `action` to the reducer. The `reducer` must handle this action
    // and return either `NoUpdate()`, `Update(state)`, `SideEffects(fn)`, or
    // `UpdateWithSideEffects(state, fn)`.
    //
    // To avoid defining functions that call `ReComponent#send` in the render
    // method, we also expose a convenience method: `ReComponent#createSender`.
    this.send = action => {
      let sideEffects;

      const updater = state => {
        const reduced = this.reducer(action, state);

        if (__DEV__) {
          if (typeof reduced === "undefined") {
            const name = this.constructor.name || this.displayName;
            throw new Error(
              name +
                "(...): `reducer` method returned `undefined`: did you " +
                "forget to handle this action? Please return `NoUpdate()`, " +
                "`Update(state)`, `SideEffects(fn)`, or " +
                "`UpdateWithSideEffects(state, fn)` instead."
            );
          }
        }

        switch (reduced.type) {
          case NO_UPDATE:
            break;
          case UPDATE:
            state = reduced.state;
            break;
          case SIDE_EFFECTS:
            sideEffects = reduced.sideEffects;
            break;
          case UPDATE_WITH_SIDE_EFFECTS:
            state = reduced.state;
            sideEffects = reduced.sideEffects;
            break;
          default: {
            if (__DEV__) {
              const name = this.constructor.name || this.displayName;
              throw new Error(
                name +
                  "(...): Return value of `reducer` method is not a valid " +
                  "action. Please use: `NoUpdate()`, `Update(state)`, " +
                  "`SideEffects(fn)`, or `UpdateWithSideEffects(state, fn)` " +
                  "instead."
              );
            }
          }
        }

        return state;
      };

      setState.call(this, updater, () => sideEffects && sideEffects());
    };

    // Convenience method to create sender functions: Functions that send an
    // action to the reducer. The created actions will follow the naming
    // conventions of [flux-standard-actions].
    //
    // If the sender is called with an argument (like an Event object for an
    // event callback), the first argument will be exposed as the `payload`.
    // Note that subsequent arguments to a sender are ignored for now.
    //
    // [flux-standard-actions]: https://github.com/redux-utilities/flux-standard-action
    this.createSender = type => {
      return payload => {
        this.send({
          type,
          payload
        });
      };
    };
  }
}
