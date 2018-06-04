// This is necessary to simulate the development environment where errors should
// be reported.
global.__DEV__ = true;

export function click(element) {
  element.dispatchEvent(new Event("click", { bubbles: true }));
}

export function withConsoleMock(fn) {
  const originalError = console.error;
  console.error = jest.fn();
  try {
    fn();
  } finally {
    console.error = originalError;
  }
}
