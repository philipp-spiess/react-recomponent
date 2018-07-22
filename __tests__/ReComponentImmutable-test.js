import React from "react";
import ReactDOM from "react-dom";
import { Record } from "immutable";

import { ReComponent, Update } from "../src";

import { click } from "./helpers";

describe("ReComponentImmutable", () => {
  let container;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  const State = Record({ count: 0 });
  class Example extends ReComponent {
    constructor() {
      super();
      this.handleClick = () => this.send({ type: "CLICK" });
    }

    unstable_initialImmutableState(props) {
      return State();
    }

    static reducer(action, state) {
      switch (action.type) {
        case "CLICK":
          return Update(state.update("count", count => count + 1));
      }
    }

    render() {
      return (
        <button onClick={this.handleClick}>
          You’ve clicked this {this.unstable_immutableState.count} times(s)
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
