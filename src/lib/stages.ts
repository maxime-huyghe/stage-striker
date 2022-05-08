export type StageData = {
  name: string;
  image: string;
};

export type StageSelected = "no" | "picked" | "banned";

export type StageId =
  | "bf"
  | "sbf"
  | "fd"
  | "lylat"
  | "ps2"
  | "sv"
  | "tc"
  | "kalos"
  | "ystory"
  | "yisland"
  | "cave"
  | "bastion";

export const LEGAL_STAGES_DATA: Readonly<Record<string, Readonly<StageData>>> = {
  bf: { name: "Battlefield", image: "images/battlefield.jpg" },
  sbf: { name: "Small Battlefield", image: "images/small_battlefield.jpg" },
  fd: { name: "Final Destination", image: "images/final_destination.jpg" },
  lylat: { name: "Lylat Cruise", image: "images/lylat_cruise.jpg" },
  ps2: { name: "Pokémon Stadium 2", image: "images/pokemon_stadium_2.jpg" },
  sv: { name: "Smashville", image: "images/smashville.jpg" },
  tc: { name: "Town and City", image: "images/town_and_city.jpg" },
  kalos: {
    name: "Kalos Pokémon League",
    image: "images/kalos_pokemon_league.jpg",
  },
  ystory: { name: "Yoshi's Story", image: "images/yoshis_story.jpg" },
  yisland: { name: "Yoshi's Island", image: "images/yoshis_island.jpg" },
  cave: { name: "Northern Cave", image: "images/northern_cave.jpg" },
  bastion: { name: "Hollow Bastion", image: "images/hollow_bastion.jpg" },
};

export const GENTLEMAN_STAGES: Readonly<string[]> = [
  "kalos",
  "ystory",
  "yisland",
  "cave",
  "bastion",
];

export const NORMAL_STAGES: Readonly<string[]> = Object.keys(LEGAL_STAGES_DATA).filter(
  (stage) => !GENTLEMAN_STAGES.includes(stage),
);
