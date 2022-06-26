import { Buffer } from "buffer";

export type SingleUnionVariant<T, K extends keyof T> = K extends any ? { type: K } & T[K] : never;

export type Unionize<T> = { [K in keyof T]: SingleUnionVariant<T, K> }[keyof T];

export const base64Encode = (str: string) => Buffer.from(str, "utf-8").toString("base64");

export const base64Decode = (str: string) => Buffer.from(str, "base64").toString("utf-8");
