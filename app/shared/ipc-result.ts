/**
 * 统一 IPC 返回格式
 *
 * 所有 invoke/handle handler 必须返回此结构，杜绝 throw。
 * 渲染端统一检查 result.success 后再消费 data。
 */
export interface IpcResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** 创建成功结果 */
export function successResult<T>(data: T): IpcResult<T> {
  return { success: true, data };
}

/** 创建错误结果（不含 data） */
export function errorResult(error: string): IpcResult<never> {
  return { success: false, error };
}
