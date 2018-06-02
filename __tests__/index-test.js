import { PID, spawn, isAlive, self, receive, send } from "../";

describe("process", () => {
  describe("spawn", () => {
    it("runs the process", done => {
      spawn(function* () { done() });
    });

    it("returns a pid", () => {
      const pid = spawn(function* () {});
      expect(pid).toBeInstanceOf(PID);
    });
  });

  describe("isAlive", () => {
    it("returns true for another process", () => {
      const pid = spawn(function* () { return });
      expect(isAlive(pid)).toBe(true);
    });
  });

  describe("send and receive", () => {
    it("can receive a messages on the main process that was already sent", async () => {
      send(self(), {
        type: "test",
        payload: { key: "value" }
      });

      const message = await receive("test");
      expect(message).toEqual({
        type: "test",
        payload: { key: "value" }
      });
    });

    it("can receive a messages on the main process that will be sent", async () => {
      setTimeout(() => {
        send(self(), {
          type: "test",
          payload: { key: "value" }
        });
      }, 0);

      const message = await receive("test");
      expect(message).toEqual({
        type: "test",
        payload: { key: "value" }
      });
    });
  });
});

// class CountServer extends GenServer {
//   getInitialState(initialProps) {
//     this.state = { counter: initialProps.counter || 0 }
//   }

//   // async
//   handleCast(action) {
//     switch (action.type) {
//       case "INCREMENT":
//         this.setState(({ count }) => {
//           count: count + 1;
//         });
//         break;
//       case "DECREMENT":
//         this.setState(({ count }) => {
//           count: count - 1;
//         });
//         break;
//     }
//   }

//   // sync
//   handleCall(action) {
//     switch (action.type) {
//       case "INCREMENT":
//         this.setState(({ count }) => {
//           count: count + 1;
//         });
//         break;
//       case "DECREMENT":
//         this.setState(({ count }) => {
//           count: count - 1;
//         });
//         break;
//     }
//   }
// }
//
// describe("react-genserver", () => {
//   it("works", () => {
//     const pid = start(CountServer)
//     console.log(pid);
//   });
// });
