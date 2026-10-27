/** 工信部 ICP 备案号。容器入口和安装包静态服务使用同一规则。 */

/** 接受「京ICP备12345678号」或带「-1」的后缀。省份简称 1 到 8 个汉字。 */
export function parseIcpNumber(raw: string | null | undefined): string {
  const text = String(raw ?? "").replace(/\s+/g, "");
  return /^[\u4e00-\u9fff]{1,8}ICP备\d{6,14}号(?:-\d{1,4})?$/.test(text) ? text : "";
}
