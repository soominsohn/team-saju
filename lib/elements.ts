export enum Element {
  WOOD = "wood",
  FIRE = "fire",
  EARTH = "earth",
  METAL = "metal",
  WATER = "water",
}

export const ELEMENT_LABELS: Record<Element, string> = {
  [Element.FIRE]: "화",
  [Element.WOOD]: "목",
  [Element.EARTH]: "토",
  [Element.METAL]: "금",
  [Element.WATER]: "수",
};

export function getElementLabel(element: string): string {
  return ELEMENT_LABELS[element as Element] || element.toUpperCase();
}

export enum YinYang {
  YANG = "yang",
  YIN = "yin",
}

export enum TenGod {
  FRIEND = "friend",
  ROB_WEALTH = "robWealth",
  FOOD_GOD = "foodGod",
  HURTING_OFFICER = "hurtingOfficer",
  DIRECT_WEALTH = "directWealth",
  INDIRECT_WEALTH = "indirectWealth",
  DIRECT_OFFICER = "directOfficer",
  INDIRECT_OFFICER = "indirectOfficer",
  DIRECT_RESOURCE = "directResource",
  INDIRECT_RESOURCE = "indirectResource",
}

const TEN_GOD_LIST = Object.values(TenGod);

export enum HeavenlyStem {
  GAP = "gap",
  EUL = "eul",
  BYEONG = "byeong",
  JEONG = "jeong",
  MU = "mu",
  GI = "gi",
  GYEONG = "gyeong",
  SIN = "sin",
  IM = "im",
  GYE = "gye",
}

export enum EarthlyBranch {
  JA = "ja",
  CHUK = "chuk",
  IN = "in",
  MYO = "myo",
  JIN = "jin",
  SA = "sa",
  O = "o",
  MI = "mi",
  SIN = "sin",
  YU = "yu",
  SUL = "sul",
  HAE = "hae",
}

export type GanJiChart = {
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  monthStem: HeavenlyStem;
  monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  hourStem?: HeavenlyStem;
  hourBranch?: EarthlyBranch;
};

export type ElementProfile = {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
};

export type MemberInsights = {
  missing: Element[];
  skewed: Element[];
};

const STEMS = [
  HeavenlyStem.GAP,
  HeavenlyStem.EUL,
  HeavenlyStem.BYEONG,
  HeavenlyStem.JEONG,
  HeavenlyStem.MU,
  HeavenlyStem.GI,
  HeavenlyStem.GYEONG,
  HeavenlyStem.SIN,
  HeavenlyStem.IM,
  HeavenlyStem.GYE,
];

const BRANCHES = [
  EarthlyBranch.JA,
  EarthlyBranch.CHUK,
  EarthlyBranch.IN,
  EarthlyBranch.MYO,
  EarthlyBranch.JIN,
  EarthlyBranch.SA,
  EarthlyBranch.O,
  EarthlyBranch.MI,
  EarthlyBranch.SIN,
  EarthlyBranch.YU,
  EarthlyBranch.SUL,
  EarthlyBranch.HAE,
];

type HiddenStem = {
  stem: HeavenlyStem;
  weight: number;
};

const HIDDEN_STEMS_MAP: Record<EarthlyBranch, HiddenStem[]> = {
  [EarthlyBranch.JA]: [{ stem: HeavenlyStem.GYE, weight: 1 }],
  [EarthlyBranch.CHUK]: [
    { stem: HeavenlyStem.GI, weight: 0.5 },
    { stem: HeavenlyStem.GYE, weight: 0.3 },
    { stem: HeavenlyStem.SIN, weight: 0.2 },
  ],
  [EarthlyBranch.IN]: [
    { stem: HeavenlyStem.GAP, weight: 0.5 },
    { stem: HeavenlyStem.BYEONG, weight: 0.3 },
    { stem: HeavenlyStem.MU, weight: 0.2 },
  ],
  [EarthlyBranch.MYO]: [{ stem: HeavenlyStem.EUL, weight: 1 }],
  [EarthlyBranch.JIN]: [
    { stem: HeavenlyStem.MU, weight: 0.5 },
    { stem: HeavenlyStem.EUL, weight: 0.3 },
    { stem: HeavenlyStem.GYE, weight: 0.2 },
  ],
  [EarthlyBranch.SA]: [
    { stem: HeavenlyStem.BYEONG, weight: 0.5 },
    { stem: HeavenlyStem.MU, weight: 0.3 },
    { stem: HeavenlyStem.GYEONG, weight: 0.2 },
  ],
  [EarthlyBranch.O]: [
    { stem: HeavenlyStem.JEONG, weight: 0.7 },
    { stem: HeavenlyStem.GI, weight: 0.3 },
  ],
  [EarthlyBranch.MI]: [
    { stem: HeavenlyStem.GI, weight: 0.5 },
    { stem: HeavenlyStem.JEONG, weight: 0.3 },
    { stem: HeavenlyStem.EUL, weight: 0.2 },
  ],
  [EarthlyBranch.SIN]: [
    { stem: HeavenlyStem.GYEONG, weight: 0.5 },
    { stem: HeavenlyStem.IM, weight: 0.3 },
    { stem: HeavenlyStem.MU, weight: 0.2 },
  ],
  [EarthlyBranch.YU]: [{ stem: HeavenlyStem.SIN, weight: 1 }],
  [EarthlyBranch.SUL]: [
    { stem: HeavenlyStem.MU, weight: 0.5 },
    { stem: HeavenlyStem.SIN, weight: 0.3 },
    { stem: HeavenlyStem.JEONG, weight: 0.2 },
  ],
  [EarthlyBranch.HAE]: [
    { stem: HeavenlyStem.IM, weight: 0.7 },
    { stem: HeavenlyStem.GAP, weight: 0.3 },
  ],
};

const getHiddenStems = (branch: EarthlyBranch): HiddenStem[] =>
  HIDDEN_STEMS_MAP[branch] ?? [];

const STEM_TO_ELEMENT: Record<HeavenlyStem, Element> = {
  [HeavenlyStem.GAP]: Element.WOOD,
  [HeavenlyStem.EUL]: Element.WOOD,
  [HeavenlyStem.BYEONG]: Element.FIRE,
  [HeavenlyStem.JEONG]: Element.FIRE,
  [HeavenlyStem.MU]: Element.EARTH,
  [HeavenlyStem.GI]: Element.EARTH,
  [HeavenlyStem.GYEONG]: Element.METAL,
  [HeavenlyStem.SIN]: Element.METAL,
  [HeavenlyStem.IM]: Element.WATER,
  [HeavenlyStem.GYE]: Element.WATER,
};

const STEM_POLARITY: Record<HeavenlyStem, YinYang> = {
  [HeavenlyStem.GAP]: YinYang.YANG,
  [HeavenlyStem.EUL]: YinYang.YIN,
  [HeavenlyStem.BYEONG]: YinYang.YANG,
  [HeavenlyStem.JEONG]: YinYang.YIN,
  [HeavenlyStem.MU]: YinYang.YANG,
  [HeavenlyStem.GI]: YinYang.YIN,
  [HeavenlyStem.GYEONG]: YinYang.YANG,
  [HeavenlyStem.SIN]: YinYang.YIN,
  [HeavenlyStem.IM]: YinYang.YANG,
  [HeavenlyStem.GYE]: YinYang.YIN,
};

const BRANCH_TO_ELEMENT: Record<EarthlyBranch, Element> = {
  [EarthlyBranch.JA]: Element.WATER,
  [EarthlyBranch.CHUK]: Element.EARTH,
  [EarthlyBranch.IN]: Element.WOOD,
  [EarthlyBranch.MYO]: Element.WOOD,
  [EarthlyBranch.JIN]: Element.EARTH,
  [EarthlyBranch.SA]: Element.FIRE,
  [EarthlyBranch.O]: Element.FIRE,
  [EarthlyBranch.MI]: Element.EARTH,
  [EarthlyBranch.SIN]: Element.METAL,
  [EarthlyBranch.YU]: Element.METAL,
  [EarthlyBranch.SUL]: Element.EARTH,
  [EarthlyBranch.HAE]: Element.WATER,
};

const DEFAULT_STEM_WEIGHT = 1.2;
const DEFAULT_BRANCH_WEIGHT = 1.0;
const BASE_DATE = Date.UTC(1984, 1, 2); // reference for 간지 cycle alignment

const elementOrder = [
  Element.WOOD,
  Element.FIRE,
  Element.EARTH,
  Element.METAL,
  Element.WATER,
];

const keyByElement: Record<Element, keyof ElementProfile> = {
  [Element.WOOD]: "wood",
  [Element.FIRE]: "fire",
  [Element.EARTH]: "earth",
  [Element.METAL]: "metal",
  [Element.WATER]: "water",
};

const elementByKey: Record<keyof ElementProfile, Element> = {
  wood: Element.WOOD,
  fire: Element.FIRE,
  earth: Element.EARTH,
  metal: Element.METAL,
  water: Element.WATER,
};

export const elementKeys = Object.keys(elementByKey) as (keyof ElementProfile)[];
export const elementKeyMap = keyByElement;
export const elementEnumByKey = elementByKey;

export const nourishMap: Record<Element, Element> = {
  [Element.WOOD]: Element.FIRE,
  [Element.FIRE]: Element.EARTH,
  [Element.EARTH]: Element.METAL,
  [Element.METAL]: Element.WATER,
  [Element.WATER]: Element.WOOD,
};

export const controlMap: Record<Element, Element> = {
  [Element.WOOD]: Element.EARTH,
  [Element.FIRE]: Element.METAL,
  [Element.EARTH]: Element.WATER,
  [Element.METAL]: Element.WOOD,
  [Element.WATER]: Element.FIRE,
};

const posMod = (value: number, mod: number) => ((value % mod) + mod) % mod;

const toUTCDate = (date: string, time?: string) => {
  const safeTime = time ?? "00:00";
  return new Date(`${date}T${safeTime}:00Z`);
};

export type BirthInput = {
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm (24h)
};

export const deriveGanJiFromBirth = ({ birthDate, birthTime }: BirthInput): GanJiChart => {
  const instant = toUTCDate(birthDate, birthTime);
  const diffDays = Math.floor((instant.getTime() - BASE_DATE) / 86_400_000);

  const year = instant.getUTCFullYear();
  const month = instant.getUTCMonth();
  const hour = instant.getUTCHours();

  const yearStem = STEMS[posMod(year - 1984, STEMS.length)];
  const yearBranch = BRANCHES[posMod(year - 1984, BRANCHES.length)];

  const monthIndex = (year - 1984) * 12 + month;
  const monthStem = STEMS[posMod(monthIndex, STEMS.length)];
  const monthBranch = BRANCHES[posMod(month, BRANCHES.length)];

  const dayStem = STEMS[posMod(diffDays, STEMS.length)];
  const dayBranch = BRANCHES[posMod(diffDays, BRANCHES.length)];

  const hourIndex = Math.floor(hour / 2);
  const hourBranch = BRANCHES[posMod(hourIndex, BRANCHES.length)];
  const hourStem = STEMS[posMod(STEMS.indexOf(dayStem) * 2 + hourIndex, STEMS.length)];

  return {
    yearStem,
    yearBranch,
    monthStem,
    monthBranch,
    dayStem,
    dayBranch,
    hourStem,
    hourBranch,
  };
};

const emptyProfile = (): ElementProfile => ({
  wood: 0,
  fire: 0,
  earth: 0,
  metal: 0,
  water: 0,
});

const addWeight = (profile: ElementProfile, element: Element, weight: number) => {
  const key = keyByElement[element];
  profile[key] += weight;
};

export const calculateElementProfile = (chart: GanJiChart): ElementProfile => {
  const profile = emptyProfile();

  const stems = [chart.yearStem, chart.monthStem, chart.dayStem, chart.hourStem].filter(
    Boolean,
  ) as HeavenlyStem[];
  const branches = [
    chart.yearBranch,
    chart.monthBranch,
    chart.dayBranch,
    chart.hourBranch,
  ].filter(Boolean) as EarthlyBranch[];

  stems.forEach((stem) => addWeight(profile, STEM_TO_ELEMENT[stem], DEFAULT_STEM_WEIGHT));
  branches.forEach((branch) => {
    const hiddenStems = getHiddenStems(branch);
    if (!hiddenStems.length) {
      addWeight(profile, BRANCH_TO_ELEMENT[branch], DEFAULT_BRANCH_WEIGHT);
      return;
    }
    hiddenStems.forEach(({ stem, weight }) => {
      addWeight(profile, STEM_TO_ELEMENT[stem], DEFAULT_BRANCH_WEIGHT * weight);
    });
  });

  const total = Object.values(profile).reduce((sum, value) => sum + value, 0) || 1;

  return {
    wood: profile.wood / total,
    fire: profile.fire / total,
    earth: profile.earth / total,
    metal: profile.metal / total,
    water: profile.water / total,
  };
};

/**
 * Calculate raw element counts without normalization.
 * Each stem/branch contributes to the total count (typically 8 pillars total).
 */
export const calculateRawElementCounts = (chart: GanJiChart): ElementProfile => {
  const profile = emptyProfile();

  const stems = [chart.yearStem, chart.monthStem, chart.dayStem, chart.hourStem].filter(
    Boolean,
  ) as HeavenlyStem[];
  const branches = [
    chart.yearBranch,
    chart.monthBranch,
    chart.dayBranch,
    chart.hourBranch,
  ].filter(Boolean) as EarthlyBranch[];

  // Count stems as 1 each
  stems.forEach((stem) => addWeight(profile, STEM_TO_ELEMENT[stem], 1));
  // Count branches as 1 each
  branches.forEach((branch) => addWeight(profile, BRANCH_TO_ELEMENT[branch], 1));

  return profile;
};

export const dominantElement = (profile: ElementProfile): Element => {
  return elementOrder.reduce((current, candidate) =>
    profile[keyByElement[candidate]] > profile[keyByElement[current]] ? candidate : current,
  );
};

export const profileInsights = (profile: ElementProfile): MemberInsights => {
  const missing: Element[] = [];
  const skewed: Element[] = [];

  elementOrder.forEach((element) => {
    const value = profile[keyByElement[element]];
    if (value < 0.1) missing.push(element);
    if (value > 0.3) skewed.push(element);
  });

  return { missing, skewed };
};

export const profileToRecord = (profile: ElementProfile): ElementProfile => ({
  wood: profile.wood,
  fire: profile.fire,
  earth: profile.earth,
  metal: profile.metal,
  water: profile.water,
});

export type TenGodProfile = Record<TenGod, number>;

const initTenGodProfile = (): TenGodProfile =>
  TEN_GOD_LIST.reduce(
    (acc, key) => ({
      ...acc,
      [key]: 0,
    }),
    {} as TenGodProfile,
  );

const determineTenGod = (dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenGod => {
  const dayElement = STEM_TO_ELEMENT[dayStem];
  const targetElement = STEM_TO_ELEMENT[targetStem];
  const samePolarity = STEM_POLARITY[dayStem] === STEM_POLARITY[targetStem];

  if (dayElement === targetElement) {
    return samePolarity ? TenGod.FRIEND : TenGod.ROB_WEALTH;
  }

  if (nourishMap[dayElement] === targetElement) {
    return samePolarity ? TenGod.FOOD_GOD : TenGod.HURTING_OFFICER;
  }

  if (nourishMap[targetElement] === dayElement) {
    return samePolarity ? TenGod.DIRECT_RESOURCE : TenGod.INDIRECT_RESOURCE;
  }

  if (controlMap[dayElement] === targetElement) {
    return samePolarity ? TenGod.DIRECT_WEALTH : TenGod.INDIRECT_WEALTH;
  }

  if (controlMap[targetElement] === dayElement) {
    return samePolarity ? TenGod.DIRECT_OFFICER : TenGod.INDIRECT_OFFICER;
  }

  return TenGod.FRIEND;
};

export const summarizeTenGods = (
  chart: GanJiChart,
  options?: { includeHidden?: boolean },
): TenGodProfile => {
  const profile = initTenGodProfile();
  const includeHidden = options?.includeHidden ?? true;
  const dayStem = chart.dayStem;

  const push = (stem?: HeavenlyStem | null, weight = 1) => {
    if (!stem || stem === dayStem) return;
    const tenGod = determineTenGod(dayStem, stem);
    profile[tenGod] += weight;
  };

  [chart.yearStem, chart.monthStem, chart.hourStem].forEach((stem) => push(stem));

  if (includeHidden) {
    [chart.yearBranch, chart.monthBranch, chart.dayBranch, chart.hourBranch]
      .filter(Boolean)
      .forEach((branch) => {
        getHiddenStems(branch as EarthlyBranch).forEach(({ stem, weight }) => push(stem, weight));
      });
  }

  return profile;
};

export const topTenGods = (profile: TenGodProfile, limit = 2): TenGod[] => {
  return [...TEN_GOD_LIST]
    .sort((a, b) => profile[b] - profile[a])
    .filter((key) => profile[key] > 0)
    .slice(0, limit);
};
