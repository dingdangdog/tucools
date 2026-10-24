export interface FramePreset {
  id: string;
  width: number;
  height: number;
  label: string;
}

export const idPhotoPresets: FramePreset[] = [
  { id: "one-inch", width: 295, height: 413, label: "一寸 295×413" },
  { id: "two-inch", width: 413, height: 626, label: "二寸 413×626" },
  { id: "passport", width: 413, height: 531, label: "护照 413×531" },
  { id: "us-2x2", width: 600, height: 600, label: "美签 600×600" },
];

export const sizePresets: FramePreset[] = [
  { id: "instagram-post", width: 1080, height: 1080, label: "Instagram 帖子 1080×1080" },
  { id: "instagram-portrait", width: 1080, height: 1350, label: "Instagram 竖图 1080×1350" },
  { id: "instagram-story", width: 1080, height: 1920, label: "Instagram 故事 1080×1920" },
  { id: "youtube-thumbnail", width: 1280, height: 720, label: "YouTube 封面 1280×720" },
  { id: "xiaohongshu", width: 1080, height: 1440, label: "小红书 1080×1440" },
];

export const idBackgrounds = [
  { id: "white", value: "#ffffff", label: "白" },
  { id: "blue", value: "#438edb", label: "蓝" },
  { id: "red", value: "#d23b3b", label: "红" },
] as const;
