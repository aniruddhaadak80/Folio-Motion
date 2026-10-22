/// <reference types="vitest/globals" />
// The `/vitest` entry point registers the matchers with vitest's `expect`
// and augments its types. The bare entry point extends jest's `expect`,
// which vitest does not use, so the matchers were untyped here.
import "@testing-library/jest-dom/vitest";
