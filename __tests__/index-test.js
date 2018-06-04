import React from "react";
import ReactDOM from "react-dom";
import { Record } from "immutable";

import {
  ReComponent,
  NoUpdate,
  Update,
  SideEffects,
  UpdateWithSideEffects
} from "../";

global.__DEV__ = true;

function click(element) {
  element.dispatchEvent(new Event("click", { bubbles: true }));
}

function withConsoleMock(fn) {
  const originalError = console.error;
  console.error = jest.fn();
  try {
    fn();
  } finally {
    console.error = originalError;
  }
}

describe("ReComponent", () => {
  let container;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  describe("with plain JS objects", () => {
    class Example extends ReComponent {
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

    it("renders the initial state", () => {
      const instance = ReactDOM.render(<Example />, container);
      expect(container.textContent).toEqual("You’ve clicked this 0 times(s)");
    });

    it("increases the counter when clicked", () => {
      const instance = ReactDOM.render(<Example />, container);
      click(container.firstChild);
      expect(container.textContent).toEqual("You’ve clicked this 1 times(s)");
    });
  });

  describe("with Immutable.JS records", () => {
    const State = Record({ count: 0 });
    class Example extends ReComponent {
      constructor() {
        super();
        this.handleClick = this.createSender("CLICK");
      }

      initialState(props) {
        return State();
      }

      reducer(action, state) {
        switch (action.type) {
          case "CLICK":
            return Update(state.update("count", count => count + 1));
        }
      }

      render() {
        return (
          <button onClick={this.handleClick}>
            You’ve clicked this {this.immutableState.count} times(s)
          </button>
        );
      }
    }

    it("renders the initial state", () => {
      const instance = ReactDOM.render(<Example />, container);
      expect(container.textContent).toEqual("You’ve clicked this 0 times(s)");
    });

    it("increases the counter when clicked", () => {
      const instance = ReactDOM.render(<Example />, container);
      click(container.firstChild);
      expect(container.textContent).toEqual("You’ve clicked this 1 times(s)");
    });
  });

  it("errors when no `reducer` method is defined", () => {
    class Example extends ReComponent {
      render() {
        return <div />;
      }
    }

    withConsoleMock(() => {
      expect(() => {
        ReactDOM.render(<Example />, container);
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe("reducer update types", () => {
    let sideEffectSpy,
      noUpdate,
      update,
      sideEffects,
      updateWithSideEffects,
      invalid,
      unhandled;
    beforeEach(() => (sideEffectSpy = jest.fn()));

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
});
