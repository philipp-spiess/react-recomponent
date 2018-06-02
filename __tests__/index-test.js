import React from "react";
import ReactDOM from "react-dom";
import { Record } from "immutable";

import { ReComponent } from "../";

global.__DEV__ = true;

function click(element) {
  element.dispatchEvent(new Event("click", { bubbles: true }));
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
        this.handleClick = this.createDispatcher("CLICK");
      }

      initialState(props) {
        return {
          count: 0
        };
      }

      reducer(action, state) {
        switch (action.type) {
          case "CLICK":
            return { count: state.count + 1 };
        }
      }

      render() {
        return (
          <button onClick={this.handleClick}>
            You've clicked this {this.state.count} times(s)
          </button>
        );
      }
    }

    it("renders the initial state", () => {
      const instance = ReactDOM.render(<Example />, container);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("increases the counter when clicked", () => {
      const instance = ReactDOM.render(<Example />, container);
      click(container.firstChild);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("with Immutable.JS records", () => {
    const State = Record({ count: 0 });
    class Example extends ReComponent {
      constructor() {
        super();
        this.handleClick = this.createDispatcher("CLICK");
      }

      initialState(props) {
        return State();
      }

      reducer(action, state) {
        switch (action.type) {
          case "CLICK":
            return state.update("count", count => count + 1);
        }
      }

      render() {
        return (
          <button onClick={this.handleClick}>
            You've clicked this {this.immutableState.count} times(s)
          </button>
        );
      }
    }

    it("renders the initial state", () => {
      const instance = ReactDOM.render(<Example />, container);
      expect(container.firstChild).toMatchSnapshot();
    });

    it("increases the counter when clicked", () => {
      const instance = ReactDOM.render(<Example />, container);
      click(container.firstChild);
      expect(container.firstChild).toMatchSnapshot();
    });
  });

  describe("with mocked console", () => {
    const originalError = console.error;
    beforeEach(() => (console.error = jest.fn()));
    afterEach(() => (console.error = originalError));
    it("errors when no `reducer` method is defined", () => {
      class Example extends ReComponent {
        render() {
          return <div />;
        }
      }

      expect(() => {
        ReactDOM.render(<Example />, container);
      }).toThrowErrorMatchingSnapshot();
    });
  });
});
