import React from "react";
import ReactDOM from "react-dom";

import {
  ReComponent,
  NoUpdate,
  Update,
  SideEffects,
  UpdateWithSideEffects
} from "../src";

import { click, withConsoleMock } from "./helpers";

describe("UpdateTypes", () => {
  let container,
    sideEffectSpy,
    noUpdate,
    update,
    sideEffects,
    updateWithSideEffects,
    invalid,
    unhandled;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    sideEffectSpy = jest.fn();
  });

  class ReducerReturns extends ReComponent {
    constructor() {
      super();
      noUpdate = this.createSender("NO_UPDATE");
      update = this.createSender("UPDATE");
      sideEffects = this.createSender("SIDE_EFFECTS");
      updateWithSideEffects = this.createSender("UPDATE_WITH_SIDE_EFFECTS");
      invalid = this.createSender("INVALID");
      unhandled = this.createSender("UNHANDLED");
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
          return SideEffects(() => sideEffectSpy());
        case "UPDATE_WITH_SIDE_EFFECTS":
          return UpdateWithSideEffects({ count: state.count + 1 }, () =>
            sideEffectSpy()
          );
        case "INVALID":
          return {};
        default:
          return;
      }
    }

    render() {
      return (
        <React.Fragment>
          You’ve clicked {this.state.count} times(s)
        </React.Fragment>
      );
    }
  }

  it("NoUpdate", () => {
    const instance = ReactDOM.render(<ReducerReturns />, container);
    noUpdate();
    expect(container.textContent).toEqual("You’ve clicked 0 times(s)");
    expect(sideEffectSpy).not.toHaveBeenCalled();
  });

  it("Update", () => {
    const instance = ReactDOM.render(<ReducerReturns />, container);
    update();
    expect(container.textContent).toEqual("You’ve clicked 1 times(s)");
    expect(sideEffectSpy).not.toHaveBeenCalled();
  });

  it("SideEffects", () => {
    const instance = ReactDOM.render(<ReducerReturns />, container);
    sideEffects();
    expect(container.textContent).toEqual("You’ve clicked 0 times(s)");
    expect(sideEffectSpy).toHaveBeenCalled();
  });

  it("UpdateWithSideEffects", () => {
    const instance = ReactDOM.render(<ReducerReturns />, container);
    updateWithSideEffects();
    expect(container.textContent).toEqual("You’ve clicked 1 times(s)");
    expect(sideEffectSpy).toHaveBeenCalled();
  });

  it("throws when an invalid value was returned", () => {
    ReactDOM.render(<ReducerReturns />, container);
    withConsoleMock(() =>
      expect(() => invalid()).toThrowErrorMatchingSnapshot()
    );
  });

  it("throws when no value was returned", () => {
    const instance = ReactDOM.render(<ReducerReturns />, container);
    withConsoleMock(() =>
      expect(() => unhandled()).toThrowErrorMatchingSnapshot()
    );
  });
});
