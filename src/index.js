import React from "react";

import { isImmutable } from "./isImmutable";

export class ReComponent extends React.Component {
  constructor(props) {
    super(props);

    if (__DEV__) {
      if(typeof this.reducer !== 'function') {
        const name = this.constructor.name || this.displayName
        throw new Error(name + '(...): No `reducer` method found on the returned component ' +
        'instance: did you define a reducer?')
      }
    }

    let stateIsImmutable = false;
    if (this.initialState) {
      let initialState = this.initialState(props);

      if (isImmutable(initialState)) {
        stateIsImmutable = true;
        initialState = { immutableState: initialState };

        // Define Immutable.js helpers
        this.setImmutableState = updater => {
          this.setState({ immutableState: updater(this.immutableState) });
        };
        Object.defineProperty(this, "immutableState", {
          get: () => this.state.immutableState
        });
      }

      this.state = initialState;
    }

    this.send = action => {
      const reduce = state => this.reducer(action, state)

      if (stateIsImmutable) {
        this.setImmutableState(reduce);
      } else {
        this.setState(reduce);
      }
    };

    this.createDispatcher = type => {
      return payload =>
        this.send({
          type,
          payload
        });
    };
  }
}
