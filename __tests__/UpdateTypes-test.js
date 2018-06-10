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
    unhandled,
    numberOfRenders;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    numberOfRenders = 0;
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
      this.state = { count: 0 };
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
      // We use this to assert that certain effects do not re-render the state.
      numberOfRenders++;

      return (
        <React.Fragment>
          You’ve clicked {this.state.count} times(s)
        </React.Fragment>
      );
    }
  }

  describe("NoUpdate", () => {
    it("does not update the state", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      noUpdate();
      expect(container.textContent).toEqual("You’ve clicked 0 times(s)");
      expect(sideEffectSpy).not.toHaveBeenCalled();
    });

    it("does not re-render", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      noUpdate();
      expect(numberOfRenders).toEqual(1);
    });
  });

  describe("Update", () => {
    it("updates the state", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      update();
      expect(container.textContent).toEqual("You’ve clicked 1 times(s)");
      expect(sideEffectSpy).not.toHaveBeenCalled();
    });

    it("re-renders", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      update();
      expect(numberOfRenders).toEqual(2);
    });
  });

  describe("SideEffects", () => {
    it("does not update the state but triggers the side effect", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      sideEffects();
      expect(container.textContent).toEqual("You’ve clicked 0 times(s)");
      expect(sideEffectSpy).toHaveBeenCalled();
    });

    it("does not re-render", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      sideEffects();
      expect(numberOfRenders).toEqual(1);
    });
  });

  describe("UpdateWithSideEffects", () => {
    it("updates the state and triggers the side effect", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      updateWithSideEffects();
      expect(container.textContent).toEqual("You’ve clicked 1 times(s)");
      expect(sideEffectSpy).toHaveBeenCalled();
    });

    it("re-renders", () => {
      const instance = ReactDOM.render(<ReducerReturns />, container);
      updateWithSideEffects();
      expect(numberOfRenders).toEqual(2);
    });
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
