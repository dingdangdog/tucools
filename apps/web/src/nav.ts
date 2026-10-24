import { markRaw, type Component } from "vue";
import {
  ArrowPathRoundedSquareIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChatBubbleBottomCenterTextIcon,
  CodeBracketIcon,
  DevicePhoneMobileIcon,
  DocumentMinusIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  IdentificationIcon,
  InformationCircleIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  ScissorsIcon,
  SparklesIcon,
  Squares2X2Icon,
  StopCircleIcon,
  SwatchIcon,
  ViewfinderCircleIcon,
} from "@heroicons/vue/24/outline";
import { copy } from "@/content/zh";

export interface NavItem {
  to: string;
  label: string;
  lead: string;
  tone: string;
  icon: Component;
}

function item(to: string, label: string, lead: string, tone: string, icon: Component): NavItem {
  return { to, label, lead, tone, icon: markRaw(icon) };
}

export const localNav: NavItem[] = [
  item("/compress", copy.tools.compress.title, copy.tools.compress.lead, "emerald", ArrowsPointingInIcon),
  item("/resize", copy.tools.resize.title, copy.tools.resize.lead, "orange", ArrowsPointingOutIcon),
  item("/converter", copy.tools.converter.title, copy.tools.converter.lead, "pink", ArrowPathRoundedSquareIcon),
  item("/cropping", copy.tools.cropping.title, copy.tools.cropping.lead, "violet", ViewfinderCircleIcon),
  item("/id-photo", copy.tools.idPhoto.title, copy.tools.idPhoto.lead, "sky", IdentificationIcon),
  item("/sizes", copy.tools.sizes.title, copy.tools.sizes.lead, "indigo", DevicePhoneMobileIcon),
  item("/cutting", copy.tools.cutting.title, copy.tools.cutting.lead, "blue", Squares2X2Icon),
  item("/watermark", copy.tools.watermark.title, copy.tools.watermark.lead, "blue", ChatBubbleBottomCenterTextIcon),
  item("/caption", copy.tools.caption.title, copy.tools.caption.lead, "sky", PencilSquareIcon),
  item("/fade", copy.tools.fade.title, copy.tools.fade.lead, "slate", SwatchIcon),
  item("/tocircle", copy.tools.tocircle.title, copy.tools.tocircle.lead, "cyan", StopCircleIcon),
  item("/exif", copy.tools.exif.title, copy.tools.exif.lead, "lime", DocumentMinusIcon),
  item("/pdf", copy.tools.pdf.title, copy.tools.pdf.lead, "rose", DocumentTextIcon),
  item("/favicon", copy.tools.favicon.title, copy.tools.favicon.lead, "orange", GlobeAltIcon),
  item("/prompt", copy.tools.prompt.title, copy.tools.prompt.lead, "cyan", CodeBracketIcon),
  item("/pix", copy.tools.pix.title, copy.tools.pix.lead, "lime", InformationCircleIcon),
];

export const aiNav: NavItem[] = [
  item("/cutout", copy.tools.cutout.title, copy.tools.cutout.lead, "blue", ScissorsIcon),
  item("/enhance", copy.tools.enhance.title, copy.tools.enhance.lead, "emerald", SparklesIcon),
  item("/erase", copy.tools.erase.title, copy.tools.erase.lead, "pink", PaintBrushIcon),
];
