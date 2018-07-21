/* @flow */

import * as React from "react";

import {
  ReComponent,

  Update,
  NoUpdate,
  SideEffects,
  UpdateWithSideEffects
} from "../../";

type Action = {| type: "A" |} | {| type: "B" |} | {| type: "C" |} | {| type: "D" |}

class StateMismatch extends ReComponent<{}, { count: number }, Action> {
  // $ExpectError
  state = { invalid: "state" };

  static reducer(action, state) {
    switch (action.type) {
      case "A":
        return Update({});
      case "B":
        return Update({ count: 1 });
      case "C":
        // $ExpectError - `count` should be `number`
        return Update({ count: "1" });
      default:
        // $ExpectError - `invalid` is missing in State
        return Update({ invalid: "state" });
    }
  }
}

class UpdateTypes extends ReComponent<{}, { count: number }, Action> {
  // Used to test the callback property of SideEffects
  someClassProperty: number;

  static reducer(action, state) {
    switch (action.type) {
      case "A":
        return NoUpdate();
      case "B":
        return Update({ count: 1 });
      case "C":
        return SideEffects((instance: UpdateTypes) => {
          instance.someClassProperty = 1;
          // $ExpectError - `instance.someClassProperty` has to be number
          instance.someClassProperty = "1";
        });
      default:
        return UpdateWithSideEffects({ count: 1 }, (instance: UpdateTypes) => {
          instance.someClassProperty = 1;
          // $ExpectError - `instance.someClassProperty` has to be number
          instance.someClassProperty = "1";

        });
    }
  }
}

class TypedActionTypes extends ReComponent<
  {},
  { count: number },
  {| type: 'CLICK' |}
> {
  handleClick = () => this.send({ type: 'CLICK' });

  static reducer(action, state) {
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
// $ExpectError - "CLACK" is invalid action type
typedActionTypes.send({ type: "CLACK" });
// $ExpectError - invalid action
typedActionTypes.send({});

typedActionTypes.handleClick();
// $ExpectError - `handleClick` expects no arguments
typedActionTypes.handleClick({});
// $ExpectError - `handleClick` expects no arguments
typedActionTypes.handleClick(1);

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
  {| type: 'CLICK' |} | {| type: 'CLACK' |}
> {
  static reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return NoUpdate();
      default: {
        // $ExpectError - should be unreachable
        absurd(action.type);
        return NoUpdate();
      }
    }
  }
}

class ExhaustivelyTypedPassingActionTypes extends ReComponent<
  {},
  { count: number },
  { type: "CLICK" } | { type: "CLACK" }
> {
  static reducer(action, state) {
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


class FailingPayloadType extends ReComponent<
  {},
  { count: number, awesome: boolean },
  { type: "CLICK", payload: number } | { type: "CLACK", payload: boolean }
> {
  // $ExpectError - `clicks` should be `number`
  handleClick = (clicks: boolean) => this.send({ type: 'CLICK', payload: clicks });
  // $ExpectError - `awesome` should be `boolean`
  handleClack = (awesome: number) => this.send({ type: 'CLACK', payload: awesome });

  static reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        // $ExpectError - `awesome` should be `boolean`, but received `number`
        return Update({ awesome: action.payload });
      case "CLACK":
        // $ExpectError - `count` should be `number`, but received `boolean`
        return Update({ count: action.payload });
      default: {
        absurd(action.type);
        return NoUpdate();
      }
    }
  }
}

class PassingPayloadType extends ReComponent<
  {},
  { count: number, awesome: boolean },
  { type: "CLICK", payload: number } | { type: "CLACK", payload: boolean }
  > {
  handleClick = (clicks: number) => this.send({ type: 'CLICK', payload: clicks });
  handleClack = (awesome: boolean) => this.send({ type: 'CLACK', payload: awesome });

  static reducer(action, state) {
    switch (action.type) {
      case "CLICK":
        return Update({ count: action.payload });
      case "CLACK":
        return Update({ awesome: action.payload });
      default: {
        absurd(action.type);
        return NoUpdate();
      }
    }
  }
}
