// import { invariant } from "./invariant";

// export function createMessageQueue() {
//   let queues = {};

//   return {
//     send: function send(action) {
//       const { type } = action;
//       invariant(type)

//       if (queues[type]) {
//         queues[type].push(action)
//       } else {
//         queues[type] = [action]
//       }
//     },

//     receive: async function receive(type) {
//       const queue = queues[type]

//       if (queue && queue.length >= 1) {
//         return queue.shift();
//       } else {
//         throw new Error('soonish');
//       }
//     }
//   };
// }
