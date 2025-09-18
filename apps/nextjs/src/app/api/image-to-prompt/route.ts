import { NextRequest, NextResponse } from "next/server";
import { cozeApiClient } from "~/lib/coze-api";

export async function POST(request: NextRequest) {
  try {
    // 检查请求是否包含文件
    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "请选择要上传的图片文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "不支持的文件类型，请上传 JPEG、PNG 或 WebP 格式的图片" },
        { status: 400 }
      );
    }

    // 验证文件大小 (限制为10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "文件大小不能超过10MB" },
        { status: 400 }
      );
    }

    // 调用扣子API生成提示词
    const prompt = await cozeApiClient.imageToPrompt(file);

    return NextResponse.json({
      success: true,
      prompt: prompt,
      fileName: file.name,
      fileSize: file.size,
    });
  } catch (error) {
    console.error("图片转提示词API错误:", error);
    
    const errorMessage = error instanceof Error ? error.message : "服务器内部错误";
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求 (CORS预检)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}