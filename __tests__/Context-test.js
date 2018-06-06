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

  const { Provider, Consumer } = React.createContext();

  class Counter extends React.Component {
    render() {
      return (
        <Consumer>
          {({ state, handleClick }) => (
            <button onClick={handleClick}>
              You’ve clicked this {state.count} times(s)
            </button>
          )}
        </Consumer>
      );
    }
  }

  class DeepTree extends React.Component {
    render() {
      return <Counter />;
    }
  }

  class Container extends ReComponent {
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
        <Provider value={{ state: this.state, handleClick: this.handleClick }}>
          <DeepTree />
        </Provider>
      );
    }
  }

  it("renders the initial state", () => {
    const instance = ReactDOM.render(<Container />, container);
    expect(container.textContent).toEqual("You’ve clicked this 0 times(s)");
  });

  it("increases the counter when clicked", () => {
    const instance = ReactDOM.render(<Container />, container);
    click(container.firstChild);
    expect(container.textContent).toEqual("You’ve clicked this 1 times(s)");
  });
});
