import { env } from "~/env.mjs";

// 扣子API基础URL
const COZE_API_BASE_URL = "https://api.coze.cn";

// 文件上传响应类型
interface CozeUploadResponse {
  code: number;
  msg: string;
  data?: {
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
  };
}

// 工作流运行响应类型
interface CozeWorkflowResponse {
  code: number;
  msg: string;
  debug_url?: string;
  data?: {
    execute_id: string;
    status: string;
    result?: any;
  };
}

// 工作流状态查询响应类型
interface CozeWorkflowStatusResponse {
  code: number;
  msg: string;
  data?: {
    execute_id: string;
    status: string; // "running" | "success" | "failed"
    result?: {
      output?: string;
    };
  };
}

class CozeApiClient {
  private apiToken: string;
  private workflowId: string;

  constructor() {
    this.apiToken = env.COZE_API_TOKEN;
    this.workflowId = env.COZE_WORKFLOW_ID;
  }

  /**
   * 上传文件到扣子平台
   * 官方文档: https://www.coze.cn/open/docs/developer_guides/upload_files
   */
  async uploadFile(file: File): Promise<CozeUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("开始上传文件:", {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        apiToken: this.apiToken ? `${this.apiToken.substring(0, 10)}...` : 'undefined'
      });

      const response = await fetch(`${COZE_API_BASE_URL}/v1/files/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
        },
        body: formData,
      });

      console.log("上传响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("上传失败响应:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result: CozeUploadResponse = await response.json();
      console.log("上传结果:", result);
      return result;
    } catch (error) {
      console.error("文件上传失败:", error);
      if (error instanceof Error) {
        throw new Error(`文件上传失败: ${error.message}`);
      }
      throw new Error("文件上传失败，请稍后重试");
    }
  }

  /**
   * 运行工作流生成图片提示词
   * 官方文档: https://www.coze.cn/open/docs/developer_guides/workflow_run
   */
  async runWorkflow(fileId: string, promptType: string = "general", userQuery?: string): Promise<CozeWorkflowResponse> {
    try {
      console.log("开始运行工作流:", {
        workflowId: this.workflowId,
        fileId: fileId,
      });

      // 构建请求参数
      const params = {
           img: {file_id:fileId},
           promptType: promptType,
           userQuery: userQuery || ""
         };
       const requestBody = {
         workflow_id: this.workflowId,
         parameters: params
       };

      console.log("运行工作流参数:", JSON.stringify(requestBody, null, 2));

      // 调用工作流API
      const response = await fetch(`${COZE_API_BASE_URL}/v1/workflow/run`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("工作流响应状态:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("工作流API错误:", errorText);
        throw new Error(`工作流API错误: ${response.status} ${errorText}`);
      }

      const result: CozeWorkflowResponse = await response.json();
      console.log("工作流响应结果:", JSON.stringify(result, null, 2));

      return result;
    } catch (error) {
      console.error("工作流运行失败:", error);
      throw error;
    }
  }

  /**
   * 查询工作流执行状态
   */
  async getWorkflowStatus(executeId: string): Promise<CozeWorkflowStatusResponse> {
    try {
      const response = await fetch(
        `${COZE_API_BASE_URL}/v1/workflow/run/retrieve?execute_id=${executeId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: CozeWorkflowStatusResponse = await response.json();
      return result;
    } catch (error) {
      console.error("查询工作流状态失败:", error);
      throw new Error("查询工作流状态失败，请稍后重试");
    }
  }

  /**
   * 完整的图片转提示词流程
   */
  async imageToPrompt(file: File, promptType: string = "general", userQuery?: string): Promise<string> {
    try {
      // 1. 上传文件
      const uploadResult = await this.uploadFile(file);
      if (uploadResult.code !== 0 || !uploadResult.data?.id) {
        throw new Error(uploadResult.msg || "文件上传失败");
      }

      console.log("文件上传成功，文件ID:", uploadResult.data.id);

      // 2. 使用工作流API生成提示词
      console.log("使用工作流API生成提示词");
      const workflowResult = await this.runWorkflow(uploadResult.data.id, promptType, userQuery);

      // 检查工作流是否成功执行
      if (workflowResult.code === 0) {
        // 直接从data字段解析结果
        if (workflowResult.data && typeof workflowResult.data === 'string') {
          try {
            const parsedData = JSON.parse(workflowResult.data);
            if (parsedData.output) {
              console.log("成功获取提示词:", parsedData.output);
              return parsedData.output;
            } else {
              throw new Error("工作流执行成功但未返回output字段");
            }
          } catch (parseError) {
            console.error("解析工作流返回数据失败:", parseError);
            throw new Error("解析工作流返回数据失败");
          }
        } else if (workflowResult.data?.execute_id) {
          // 如果返回execute_id，则需要轮询查询结果
          const executeId = workflowResult.data.execute_id;
          let attempts = 0;
          const maxAttempts = 30; // 最多等待30次，每次2秒

          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // 等待2秒

            const statusResult = await this.getWorkflowStatus(executeId);
            if (statusResult.code !== 0) {
              throw new Error(statusResult.msg || "查询状态失败");
            }

            const status = statusResult.data?.status;
            if (status === "success") {
              const output = statusResult.data?.result?.output;
              if (output) {
                return output;
              } else {
                throw new Error("工作流执行成功但未返回结果");
              }
            } else if (status === "failed") {
              throw new Error("工作流执行失败");
            }
            // status === "running" 继续等待

            attempts++;
          }

          throw new Error("工作流执行超时，请稍后重试");
        } else {
          throw new Error("工作流返回数据格式异常");
        }
      }
      // 如果有debug_url，说明参数已被接受但可能有配置问题
      else if (workflowResult.debug_url) {
        console.log("工作流参数正确但执行有问题，debug_url:", workflowResult.debug_url);
        throw new Error(`工作流配置问题，调试链接: ${workflowResult.debug_url}。错误信息: ${workflowResult.msg}`);
      }
      // 否则是参数错误
      else {
        throw new Error(workflowResult.msg || "工作流启动失败");
      }
    } catch (error) {
      console.error("图片转提示词失败:", error);
      throw error;
    }
  }
}

// 导出单例实例
export const cozeApiClient = new CozeApiClient();
export type { CozeUploadResponse, CozeWorkflowResponse, CozeWorkflowStatusResponse };