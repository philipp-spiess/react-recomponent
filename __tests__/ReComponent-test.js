import React from "react";
import ReactDOM from "react-dom";

import { ReComponent, NoUpdate, Update } from "../src";

import { click, withConsoleMock } from "./helpers";

describe("ReComponent", () => {
  let container;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  class Example extends ReComponent {
    constructor() {
      super();
      this.handleClick = this.createSender("CLICK");
      this.state = { count: 0 };
    }

    static reducer(action, state) {
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
      static reducer() {}
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
    let originalNodeEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";

      let click;
      class Example extends ReComponent {
        constructor() {
          super();
          click = () => this.send({ type: "CLICK" });
        }

        static reducer(action, state) {
          return {};
        }

        render() {
          return null;
        }
      }

      ReactDOM.render(<Example />, container);
      expect(() => click()).not.toThrowError();
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});
