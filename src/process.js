import {ProcessSystem} from "erlang-processes";

const processSystem = new ProcessSystem();

// import { createPid, mainThreadPid, self } from "./pid";
// import { createMessageQueue } from "./message-queue";
import { invariant } from "./invariant";

// const processes = new Map();
// processes.set(mainThreadPid, createMessageQueue());

// export function start(GenServer, initialProps = {}) {
//   const server = new GenServer(initialProps);
//   const pid = createPid();

//   processes.set(pid, server);
//   return pid;
// }

export function self() {
  return processSystem.pid();
}

export function spawn(process) {
  return processSystem.spawn(process);
}

export function send(pid, action) {
  invariant(pid);
  invariant(action);


  return processSystem.send(pid, action);
}

export async function receive(type = null) {
  return new Promise(function*(resolve) {
    yield processSystem.receive((a) => {
      console.log('receive', a)
      resolve(a)
    }, 0, reject);
  })
}

export function isAlive(pid) {
  return processSystem.is_alive(pid);
}
