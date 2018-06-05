/* @flow */

import * as React from "react";

import {
  ReComponent,

  Update,
  NoUpdate,
  SideEffects,
  UpdateWithSideEffects
} from "../../";

class UntypedActionTypes extends ReComponent<{}, { count: number }> {
  handleClick = this.createSender("CLICK");
  // $ExpectError
  handleFoo = this.createSender();

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
}
const untypedActionTypes = new UntypedActionTypes();
untypedActionTypes.send({ type: "CLICK" });
untypedActionTypes.send({ type: "CLACK" });
// $ExpectError
untypedActionTypes.send({});

untypedActionTypes.handleClick();
untypedActionTypes.handleClick({});
untypedActionTypes.handleClick(1);
// $ExpectError
untypedActionTypes.handleClick({}, {});

class StateMismatch extends ReComponent<{}, { count: number }> {
  initialState(props) {
    // $ExpectError
    return {
      invalid: "state"
    };
  }

  reducer(action, state) {
    switch (action.type) {
      case "A":
        return Update({});
      case "B":
        return Update({ count: 1 });
      case "C":
        // $ExpectError
        return Update({ count: "1" });
      default:
        // $ExpectError
        return Update({ invalid: "state" });
    }
  }
}

class UpdateTypes extends ReComponent<{}, { count: number }> {
  reducer(action, state) {
    switch (action.type) {
      case "A":
        return NoUpdate();
      case "B":
        return Update({ count: 1 });
      case "C":
        return SideEffects(() => true);
      default:
        return UpdateWithSideEffects({ count: 1 }, () => true);
    }
  }
}

class TypedActionTypes extends ReComponent<{}, { count: number }, "CLICK"> {
  handleClick = this.createSender("CLICK");
  // $ExpectError
  handleFoo = this.createSender("CLACK");
  // $ExpectError
  handleBar = this.createSender();

  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return NoUpdate();
      default:
        return NoUpdate();
    }
  }
}

const typedActionTypes = new TypedActionTypes();
typedActionTypes.send({ type: "CLICK" });
// $ExpectError
typedActionTypes.send({ type: "CLACK" });
// $ExpectError
typedActionTypes.send({});

typedActionTypes.handleClick();
typedActionTypes.handleClick({});
typedActionTypes.handleClick(1);
// $ExpectError
typedActionTypes.handleClick({}, {});

// Flow can verify that we've handled every defined action type for us through
// what is called [exhaustiveness testing].
//
// This can be done by using the special type `empty` and casting to it in the
// `default` or `else` branch. This will fail once Flow determines it can be
// reached.
//
// [exhaustiveness testing]: https://blog.jez.io/flow-exhaustiveness/
const absurd = <T>(x: empty): T => {
  throw new Error("absurd");
};
class ExhaustivelyTypedFailingActionTypes extends ReComponent<
  {},
  { count: number },
  "CLICK" | "CLACK"
> {
  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return NoUpdate();
      default: {
        // $ExpectError
        absurd(action.type);
        return NoUpdate();
      }
    }
  }
}
class ExhaustivelyTypedPassingActionTypes extends ReComponent<
  {},
  { count: number },
  "CLICK" | "CLACK"
> {
  reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return NoUpdate();
      case "CLACK":
        return NoUpdate();
      default: {
        absurd(action.type);
        return NoUpdate();
      }
    }
  }
}
