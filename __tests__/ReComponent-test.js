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

import { click, withConsoleMock } from "./helpers";

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

  it("disables `setState`", () => {
    let setState;
    class Example extends ReComponent {
      constructor() {
        super();
        setState = () => this.setState({ some: "state" });
      }
      reducer() {}
      render() {
        return null;
      }
    }

    ReactDOM.render(<Example />, container);
    withConsoleMock(() => {
      expect(() => setState()).toThrowErrorMatchingSnapshot();
    });
  });

  it("does not throw errors in production", () => {
    try {
      global.__DEV__ = false;

      let click;
      class Example extends ReComponent {
        constructor() {
          super();
          click = this.createSender("CLICK");
        }

        reducer(action, state) {
          return {};
        }

        render() {
          return null;
        }
      }

      ReactDOM.render(<Example />, container);
      expect(() => click()).not.toThrowError();
    } finally {
      global.__DEV__ = true;
    }
  });
});
