export const projectRepo = "https://github.com/dingdangdog/tucools";
export const projectReleases = "https://github.com/dingdangdog/tucools/releases";

// 模型不足时三个入口。Docker 和客户端说明都在仓库 README，模型包在 models 发布页。
export const modelChoiceLinks = {
  docker: "https://github.com/dingdangdog/tucools",
  client: "https://github.com/dingdangdog/tucools",
  models: "https://github.com/dingdangdog/tucools/releases/tag/models",
} as const;
