"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@saasfly/ui/button";
import { Check, Copy, Image as ImageIcon, Spinner, Close } from "@saasfly/ui/icons";

const AI_MODELS = [
  {
    id: "general",
    name: "General Image Prompt",
    description: "Natural language description of the image",
    selected: true,
  },
  {
    id: "flux",
    name: "Flux",
    description: "Optimized for state-of-the-art Flux AI models, concise natural language",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    description: "Tailored for Midjourney generation with Midjourney parameters",
  },
  {
    id: "stable",
    name: "Stable Diffusion",
    description: "Formatted for Stable Diffusion models",
  },
];

export default function ImageToPromptPage() {
  const [selectedModel, setSelectedModel] = useState("general");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file: File) => {
    // 验证文件类型
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("不支持的文件类型，请上传 JPEG、PNG 或 WebP 格式的图片");
      return;
    }

    // 验证文件大小 (限制为10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("文件大小不能超过10MB");
      return;
    }

    setError(null);
    setUploadedFile(file);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setUploadedImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGeneratePrompt = async () => {
    if (!uploadedFile) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedPrompt("");

    try {
      const formData = new FormData();
      formData.append("image", uploadedFile);

      const response = await fetch("/api/image-to-prompt", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "生成提示词失败");
      }

      if (result.success && result.prompt) {
        setGeneratedPrompt(result.prompt);
      } else {
        throw new Error("未能生成提示词");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "生成提示词时发生错误";
      setError(errorMessage);
      console.error("生成提示词失败:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Free Image to Prompt Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Convert Image to Prompt to generate your own image
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-sm">
            <button className="flex items-center px-4 py-2 bg-purple-100 text-purple-600 rounded-md font-medium">
              <ImageIcon className="w-4 h-4 mr-2" />
              Image to Prompt
            </button>
            <button className="flex items-center px-4 py-2 text-gray-600 font-medium">
              <ImageIcon className="w-4 h-4 mr-2" />
              Text to Prompt
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Upload */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex gap-4 mb-4">
                <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-4 py-2">
                  Upload Image
                </Button>
                <Button variant="outline" className="border-gray-300 text-gray-600 rounded-lg px-4 py-2">
                  Input Image URL
                </Button>
              </div>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-300 bg-gray-50"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedImage ? (
                  <div className="relative">
                    <Image
                      src={uploadedImage}
                      alt="Uploaded"
                      width={300}
                      height={200}
                      className="mx-auto rounded-lg object-cover"
                    />
                    <Button
                      onClick={() => setUploadedImage(null)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                    >
                      <Close className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="font-medium text-gray-700">Upload a photo or drag and drop</p>
                      <p className="text-sm text-gray-500">PNG, JPG, or WEBP up to 4MB</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-block bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* AI Model Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select AI Model</h3>
              <div className="grid grid-cols-2 gap-3">
                {AI_MODELS.map((model) => (
                  <div
                    key={model.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedModel(model.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedModel(model.id);
                      }
                    }}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedModel === model.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{model.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{model.description}</p>
                      </div>
                      {selectedModel === model.id && (
                        <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <label htmlFor="prompt-language" className="block text-sm font-medium text-gray-900 mb-2">
                Prompt Language
              </label>
              <select id="prompt-language" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="english">English</option>
                <option value="chinese">中文</option>
                <option value="japanese">日本語</option>
              </select>
            </div>

            {/* Generate Button */}
            <div className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}
              
              <Button
                onClick={handleGeneratePrompt}
                disabled={!uploadedImage || isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-3 text-lg font-medium disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Spinner className="w-5 h-5 animate-spin" />
                    Generating...
                  </div>
                ) : (
                  "Generate Prompt"
                )}
              </Button>
              <Link href="#" className="block text-center text-purple-600 hover:text-purple-700 text-sm">
                View History
              </Link>
            </div>
          </div>

          {/* Right Column - Preview & Result */}
          <div className="space-y-6">
            {/* Image Preview */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Preview</h3>
              <div className="border border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                {uploadedImage ? (
                  <Image
                    src={uploadedImage}
                    alt="Preview"
                    width={400}
                    height={300}
                    className="mx-auto rounded-lg object-cover max-h-80"
                  />
                ) : (
                  <div className="py-12">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Your image will show here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Generated Prompt Result */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Prompt</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-32">
                {generatedPrompt ? (
                  <div className="space-y-3">
                    <p className="text-gray-800">{generatedPrompt}</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigator.clipboard.writeText(generatedPrompt)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Generated prompt will appear here</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="mt-12 text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-4xl mx-auto">
            <p className="text-yellow-800">
              Want to analyze specific aspects like art style or describe people in the image? Try our{" "}
              <Link href="/ai-describe-image" className="text-purple-600 hover:text-purple-700 font-medium">
                AI Describe Image
              </Link>{" "}
              tool for detailed analysis.
            </p>
          </div>
        </div>

        {/* Final Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Highly Accurate Image to Prompt Generation
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Convert original images to prompts and regenerated with AI to see our prompt accuracy
          </p>
        </div>
      </div>
    </div>
  );
}