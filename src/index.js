// export {  self } from './pid'
export { start, self, spawn, send, receive, isAlive } from "./process";

export {PID } from "erlang-types"
// export class GenServer {
//   constructor(initialProps) {
//     this.getInitialState && this.setState(this.getInitialState(initialProps));
//   }

//   setState(updater) {
//     let nextState = updater;
//     if (typeof updater == "function") {
//       nextState = updater(this.state);
//     }

//     this.state = Object.assign({}, this.state, nextState);
//   }

//   cast() {}

//   call() {}
// }

// export { start, spawn, send, receive };
