import type { LocaleCode } from "../locale";
import { ar } from "./ar";
import { bn } from "./bn";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { hi } from "./hi";
import { ja } from "./ja";
import { ptBr } from "./pt-br";
import { vn } from "./vn";
import { zh, type Copy } from "./zh";
import { zhHant } from "./zh-hant";

export const catalogs: Record<LocaleCode, Copy> = {
  zh,
  en,
  zh_hant: zhHant,
  es,
  de,
  ja,
  pt_br: ptBr,
  hi,
  vn,
  ar,
  bn,
};
