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
  "id-photo",
  "sizes",
  "cutting",
  "watermark",
  "caption",
  "fade",
  "tocircle",
  "pdf",
  "favicon",
  "exif",
  "pix",
  "prompt",
] as const;

function present(id: keyof typeof toolKey, tone: string, icon: Component): NavItem {
  const tool = copy.tools[toolKey[id]];
  return {
    id,
    to: localePath(`/${id}`, currentLocale.value),
    label: tool.title,
    lead: tool.lead,
    tone,
    icon: markRaw(icon),
  };
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
        present("id-photo", "sky", IdentificationIcon),
        present("sizes", "indigo", DevicePhoneMobileIcon),
        present("cutting", "blue", Squares2X2Icon),
        present("watermark", "blue", ChatBubbleBottomCenterTextIcon),
        present("caption", "sky", PencilSquareIcon),
        present("fade", "slate", SwatchIcon),
        present("tocircle", "cyan", StopCircleIcon),
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
