type SingleUnionVariant<T, K extends keyof T> = K extends any ? { type: K } & T[K] : never;
export type Unionize<T> = { [K in keyof T]: SingleUnionVariant<T, K> }[keyof T];
