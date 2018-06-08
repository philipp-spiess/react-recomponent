import React from "react";
import ReactDOM from "react-dom";

import {
  RePureComponent,
  NoUpdate,
  Update,
  SideEffects,
  UpdateWithSideEffects
} from "../src";

import { click, withConsoleMock } from "./helpers";

describe("RePureComponent", () => {
  let container;
  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  class Example extends RePureComponent {
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
