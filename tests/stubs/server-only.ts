// Intentional no-op stub for the `server-only` package during tests.
// The real package throws at bundle-time when imported from client code;
// in a unit-test environment we just want it to be importable.
export {};
