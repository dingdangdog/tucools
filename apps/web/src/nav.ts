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
  BuildingStorefrontIcon,
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
import { copy, currentLocale } from "@/content";
import { localePath } from "@/locale";

export interface NavItem {
  id: string;
  to: string;
  label: string;
  lead: string;
  tone: string;
  icon: Component;
}

const toolKey = {
  compress: "compress",
  resize: "resize",
  converter: "converter",
  cropping: "cropping",
  "id-photo": "idPhoto",
  sizes: "sizes",
  store: "store",
  cutting: "cutting",
  watermark: "watermark",
  caption: "caption",
  fade: "fade",
  tocircle: "tocircle",
  exif: "exif",
  pdf: "pdf",
  favicon: "favicon",
  prompt: "prompt",
  pix: "pix",
  cutout: "cutout",
  enhance: "enhance",
  erase: "erase",
} as const;

export const allNavIds = [
  "cutout",
  "enhance",
  "erase",
  "compress",
  "resize",
  "converter",
  "cropping",
  "cutting",
  "watermark",
  "caption",
  "fade",
  "pdf",
  "favicon",
  "exif",
  "pix",
  "prompt",
] as const;

/** 侧栏和首页只出现一次「裁剪」。这些地址仍各自独立，在裁剪页里切换。切图是拆成多块，不在这里。 */
export const cropModeIds = ["cropping", "id-photo", "sizes", "store", "tocircle"] as const;

export type CropModeId = (typeof cropModeIds)[number];

export function isCropMode(id: string): id is CropModeId {
  return (cropModeIds as readonly string[]).includes(id);
}

/** 自由裁剪仍是 `/cropping`。其余裁剪方式挂在它下面。 */
export function cropModePath(id: string): string {
  if (isCropMode(id) && id !== "cropping") return `/cropping/${id}`;
  return `/${id}`;
}

function present(id: keyof typeof toolKey, tone: string, icon: Component): NavItem {
  const tool = copy.tools[toolKey[id]];
  return {
    id,
    to: localePath(cropModePath(id), currentLocale.value),
    label: tool.title,
    lead: id === "cropping" ? copy.cropFamilyLead : tool.lead,
    tone,
    icon: markRaw(icon),
  };
}

const cropModeIcon = {
  cropping: ViewfinderCircleIcon,
  "id-photo": IdentificationIcon,
  sizes: DevicePhoneMobileIcon,
  store: BuildingStorefrontIcon,
  tocircle: StopCircleIcon,
} as const;

export function cropModeNav(ids: readonly string[]): NavItem[] {
  return cropModeIds.filter((id) => ids.includes(id)).map((id) => present(id, "violet", cropModeIcon[id]));
}

export function createNavGroups() {
  return [
    {
      id: "ai",
      label: copy.aiGroup,
      items: [
        present("cutout", "blue", ScissorsIcon),
        present("enhance", "emerald", SparklesIcon),
        present("erase", "pink", PaintBrushIcon),
      ],
    },
    {
      id: "local",
      label: copy.localGroup,
      items: [
        present("compress", "emerald", ArrowsPointingInIcon),
        present("resize", "orange", ArrowsPointingOutIcon),
        present("converter", "pink", ArrowPathRoundedSquareIcon),
        present("cropping", "violet", ViewfinderCircleIcon),
        present("cutting", "blue", Squares2X2Icon),
        present("watermark", "blue", ChatBubbleBottomCenterTextIcon),
        present("caption", "sky", PencilSquareIcon),
        present("fade", "slate", SwatchIcon),
        present("pdf", "rose", DocumentTextIcon),
        present("favicon", "orange", GlobeAltIcon),
      ],
    },
    {
      id: "info",
      label: copy.infoGroup,
      items: [
        present("exif", "lime", DocumentMinusIcon),
        present("pix", "lime", InformationCircleIcon),
        present("prompt", "cyan", CodeBracketIcon),
      ],
    },
  ];
}
