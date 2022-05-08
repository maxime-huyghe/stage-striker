export type Player = 1 | 2;

export type Turn = { ty: "ban" | "pick"; num: number; player: "winner" | "loser" };

export type SelectionResult = {
  picked: string[];
  banned: string[];
};

export const GENTLEMAN_TURNS: Readonly<Turn[]> = [
  { ty: "pick", num: 1, player: "winner" },
  { ty: "pick", num: 1, player: "loser" },
];
