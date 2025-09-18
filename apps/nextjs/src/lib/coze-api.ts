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
  async runWorkflow(fileId: string): Promise<CozeWorkflowResponse> {
    try {
      console.log("开始运行工作流:", {
        workflowId: this.workflowId,
        fileId: fileId,
      });

      // 根据用户提供的扣子工作流参数配置
      const parameterFormats = [
        // 格式1: 匹配扣子工作流的确切参数（img: Image, promptType: String, userQuery: String 可选）
        {
          workflow_id: this.workflowId,
          parameters: {
            img: fileId,
            promptType: "general",
            userQuery: "Generate a detailed prompt for this image"
          }
        },
        // 格式2: 只包含必填参数（img 和 promptType）
        {
          workflow_id: this.workflowId,
          parameters: {
            img: fileId,
            promptType: "general"
          }
        },
        // 格式3: 使用不同的 promptType 值
        {
          workflow_id: this.workflowId,
          parameters: {
            img: fileId,
            promptType: "detailed",
            userQuery: "Generate a detailed prompt for this image"
          }
        },
        // 格式4: 使用 midjourney 类型
        {
          workflow_id: this.workflowId,
          parameters: {
            img: fileId,
            promptType: "midjourney",
            userQuery: "Generate a Midjourney-style prompt for this image"
          }
        },
        // 格式5: 使用 flux 类型
        {
          workflow_id: this.workflowId,
          parameters: {
            img: fileId,
            promptType: "flux",
            userQuery: "Generate a Flux-optimized prompt for this image"
          }
        },
        // 格式6: 空的 userQuery（因为它是可选的）
        {
          workflow_id: this.workflowId,
          parameters: {
            img: fileId,
            promptType: "general",
            userQuery: ""
          }
        }
      ];

      for (let i = 0; i < parameterFormats.length; i++) {
        const requestBody = parameterFormats[i];

        try {
          console.log(`尝试工作流格式 ${i + 1}:`, JSON.stringify(requestBody, null, 2));

          const response = await fetch(`${COZE_API_BASE_URL}/v1/workflow/run`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${this.apiToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          console.log(`工作流格式 ${i + 1} 响应状态:`, response.status, response.statusText);

          const result: CozeWorkflowResponse = await response.json();
          console.log(`工作流格式 ${i + 1} 响应结果:`, JSON.stringify(result, null, 2));

          // 检查业务逻辑是否成功
          if (result.code === 0) {
            console.log(`工作流格式 ${i + 1} 成功!`);
            return result;
          } else {
            // 如果有debug_url，说明参数已被接受但执行有问题
            if (result.debug_url) {
              console.log(`工作流格式 ${i + 1} 参数正确但执行失败，debug_url: ${result.debug_url}`);
              // 即使失败，也返回结果让调用者处理
              return result;
            }
            console.log(`工作流格式 ${i + 1} 业务逻辑失败:`, result.msg);
          }
        } catch (formatError) {
          console.error(`工作流格式 ${i + 1} 异常:`, formatError);
        }
      }

      throw new Error("所有工作流参数格式都失败了");
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
  async imageToPrompt(file: File): Promise<string> {
    try {
      // 1. 上传文件
      const uploadResult = await this.uploadFile(file);
      if (uploadResult.code !== 0 || !uploadResult.data?.id) {
        throw new Error(uploadResult.msg || "文件上传失败");
      }

      console.log("文件上传成功，文件ID:", uploadResult.data.id);

      // 2. 使用工作流API生成提示词
      console.log("使用工作流API生成提示词");
      const workflowResult = await this.runWorkflow(uploadResult.data.id);

      // 检查工作流是否成功启动
      if (workflowResult.code === 0 && workflowResult.data?.execute_id) {
        // 3. 轮询查询结果
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