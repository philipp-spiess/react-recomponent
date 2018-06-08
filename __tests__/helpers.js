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
