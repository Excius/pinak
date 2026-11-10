// Mirror of INDIAN_STATES_AND_CODES from @repo/types (packages/types/src/api/address.ts).
// The web app can't import runtime values from that package: its build is CommonJS, which the
// browser rejects ("doesn't provide an export named ..."), so the list is kept here instead.
// The API validates state names (case-insensitive) and derives the state code itself.
const INDIAN_STATES_AND_CODES: Record<string, string> = {
  "JAMMU AND KASHMIR": "01",
  "HIMACHAL PRADESH": "02",
  PUNJAB: "03",
  CHANDIGARH: "04",
  UTTARAKHAND: "05",
  HARYANA: "06",
  DELHI: "07",
  RAJASTHAN: "08",
  "UTTAR PRADESH": "09",
  BIHAR: "10",
  SIKKIM: "11",
  "ARUNACHAL PRADESH": "12",
  NAGALAND: "13",
  MANIPUR: "14",
  MIZORAM: "15",
  TRIPURA: "16",
  MEGHALAYA: "17",
  ASSAM: "18",
  "WEST BENGAL": "19",
  JHARKHAND: "20",
  ODISHA: "21",
  CHHATTISGARH: "22",
  "MADHYA PRADESH": "23",
  GUJARAT: "24",
  "DADRA AND NAGAR HAVELI AND DAMAN AND DIU": "26",
  MAHARASHTRA: "27",
  "ANDHRA PRADESH": "37",
  KARNATAKA: "29",
  GOA: "30",
  LAKSHADWEEP: "31",
  KERALA: "32",
  "TAMIL NADU": "33",
  PUDUCHERRY: "34",
  "ANDAMAN AND NICOBAR ISLANDS": "35",
  TELANGANA: "36",
  LADAKH: "38",
};

export const stateCodeFor = (state: string): string | undefined =>
  INDIAN_STATES_AND_CODES[state.trim().toUpperCase()];

/** Title-cased state names for dropdowns, e.g. "Tamil Nadu". */
export const INDIAN_STATE_NAMES: string[] = Object.keys(
  INDIAN_STATES_AND_CODES,
).map((name) =>
  name.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()),
);
