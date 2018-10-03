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

        if (typeof this.constructor.reducer !== "function") {
          throw new Error(
            name +
              "(...): No static `reducer` method found on the returned " +
              "component instance: did you define a reducer?"
          );
        }
      }

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
          const reduced = this.constructor.reducer(action, state);

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
