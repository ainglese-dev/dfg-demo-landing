import type { Env } from '../index';

// [DEV_LOG] Verbose logs gated on env.DEBUG === '1'. Errors always surface.
export const dlog = (env: Env, ...args: unknown[]): void => {
  if (env.DEBUG === '1') console.log(...args);
};

export const derr = (...args: unknown[]): void => {
  console.error(...args);
};
