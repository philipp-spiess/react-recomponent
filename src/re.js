import {
  NO_UPDATE,
  UPDATE,
  SIDE_EFFECTS,
  UPDATE_WITH_SIDE_EFFECTS
} from "./update-types";

export function Re(Component) {
  return class extends Component {
    constructor(props) {
      super(props);

      if (process.env.NODE_ENV !== "production") {
        const name = this.displayName || this.constructor.name;

        const isStaticReducer = typeof this.constructor.reducer === "function";
        const isPropertyReducer = typeof this.reducer === "function";

        // @TODO: Remove property reducer support with v1.0.0
        if (isPropertyReducer) {
          console.warn(
            name +
              "(...): Class property `reducer` methods are deprecated. Please " +
              "upgrade to `static` reducers instead: " +
              "https://github.com/philipp-spiess/react-recomponent#why-is-the-reducer-static"
          );
        }

        if (!(isStaticReducer || isPropertyReducer)) {
          throw new Error(
            name +
              "(...): No `reducer` method found on the returned component " +
              "instance: did you define a reducer?"
          );
        }
      }

      // We might overwrite setState later for the Immutable.js helpers, thus we
      // keep a reference to the original method around as well.
      const originalSetState = this.setState;
      let setState = this.setState;

      if (process.env.NODE_ENV !== "production") {
        this.setState = () => {
          const name = this.displayName || this.constructor.name;
          throw new Error(
            name +
              "(...): Calls to `setState` are not allowed. Please use the " +
              "`reducer` method to update the component state"
          );
        };
      }

      // We allow a hidden `Component#initialImmutableState` option to
      // initialize the component state based on a returned Immutable.js record
      // type.
      //
      // To manage the state, we define a couple of helper methods to make it
      // work as a regular Component state must always be a plain JavaScript
      // object.
      //
      // To emulate an Immutable.js object, we use a JavaScript object
      // consisting of only one key: `immutableState`. To make the render method
      // easier, we also expose `Component#immutableState` to access the
      // components state since we don't want to overwrite `Component#state`.
      //
      // Note that this is unstable API and should not be used.
      if (typeof this.initialImmutableState === "function") {
        this.state = {
          immutableState: this.initialImmutableState(props)
        };

        setState = (updater, callback) => {
          originalSetState.call(
            this,
            (state, props) => ({
              immutableState: updater(state.immutableState, props)
            }),
            callback
          );
        };
        Object.defineProperty(this, "immutableState", {
          get: () => this.state.immutableState
        });
      }

      // Sends an `action` to the reducer. The `reducer` must handle this action
      // and return either `NoUpdate()`, `Update(state)`, `SideEffects(fn)`, or
      // `UpdateWithSideEffects(state, fn)`.
      //
      // To avoid defining functions that call `ReComponent#send` in the render
      // method, we also expose a convenience method: `ReComponent#createSender`.
      //
      // @see https://git.io/vh2AY
      this.send = action => {
        let sideEffects;

        const updater = state => {
          let reduced;
          if (typeof this.reducer === "function") {
            reduced = this.reducer(action, state);
          } else {
            reduced = this.constructor.reducer(action, state);
          }

          if (process.env.NODE_ENV !== "production") {
            if (typeof reduced === "undefined") {
              const name = this.displayName || this.constructor.name;
              throw new Error(
                name +
                  "(...): `reducer` method returned `undefined`: did you " +
                  "forget to handle this action? Please return `NoUpdate()`, " +
                  "`Update(state)`, `SideEffects(fn)`, or " +
                  "`UpdateWithSideEffects(state, fn)` instead."
              );
            }
          }

          switch (reduced.type) {
            case NO_UPDATE:
              state = null;
              break;
            case UPDATE:
              state = reduced.state;
              break;
            case SIDE_EFFECTS:
              state = null;
              sideEffects = reduced.sideEffects;
              break;
            case UPDATE_WITH_SIDE_EFFECTS:
              state = reduced.state;
              sideEffects = reduced.sideEffects;
              break;
            default: {
              if (process.env.NODE_ENV !== "production") {
                const name = this.displayName || this.constructor.name;
                throw new Error(
                  name +
                    "(...): Return value of `reducer` method is not a valid " +
                    "action. Please use: `NoUpdate()`, `Update(state)`, " +
                    "`SideEffects(fn)`, or `UpdateWithSideEffects(state, fn)` " +
                    "instead."
                );
              }
            }
          }

          return state;
        };

        setState.call(this, updater, () => sideEffects && sideEffects(this));
      };

      // Convenience method to create sender functions: Functions that send an
      // action to the reducer. The created actions will follow the naming
      // conventions of [flux-standard-actions].
      //
      // If the sender is called with an argument (like an Event object for an
      // event callback), the first argument will be exposed as the `payload`.
      // Note that subsequent arguments to a sender are ignored for now.
      //
      // [flux-standard-actions]: https://github.com/redux-utilities/flux-standard-action
      this.createSender = type => {
        return payload => {
          this.send({
            type,
            payload
          });
        };
      };
    }
  };
}
