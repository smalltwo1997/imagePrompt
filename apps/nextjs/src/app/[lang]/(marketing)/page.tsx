import Link from "next/link";

import { Button } from "@saasfly/ui/button";
import * as Icons from "@saasfly/ui/icons";

import type { Locale } from "~/config/i18n-config";

export default function IndexPage({
  params: { lang: _lang },
}: {
  params: {
    lang: Locale;
  };
}) {

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-6xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Create Better AI Art
              <br />
              with <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Image Prompt</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Inspire ideas, Enhance image prompt, Create masterpieces
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full text-lg px-8 py-4 h-auto font-semibold">
                Try it now !
              </Button>
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 rounded-full text-lg px-8 py-4 h-auto font-semibold">
                Tutorials
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">

            {/* Feature Card 1: Image to Prompt - Purple */}
            <Link href="/image-to-prompt" className="text-center group cursor-pointer block">
              <div className="w-16 h-16 mx-auto mb-6 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Icons.Image className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Image to Prompt
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Convert Image to Prompt to generate your own image
              </p>
            </Link>

            {/* Feature Card 2: Magic Enhance - Orange/Yellow */}
            <Link href="/magic-enhance" className="text-center group cursor-pointer block">
              <div className="w-16 h-16 mx-auto mb-6 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <Icons.Sparkles className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">
                Magic Enhance
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Transform simple text into detailed, descriptive image prompt
              </p>
            </Link>

            {/* Feature Card 3: AI Describe Image - Blue */}
            <Link href="/ai-describe-image" className="text-center group cursor-pointer block">
              <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Icons.Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                AI Describe Image
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Let AI help you understand and analyze any image in detail
              </p>
            </Link>

            {/* Feature Card 4: AI Image Generator - Green */}
            <Link href="/ai-image-generator" className="text-center group cursor-pointer block">
              <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Icons.Zap className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                AI Image Generator
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Transform your image prompt into stunning visuals with AI-powered generation
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Links Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <p className="text-gray-600 mb-6">
              You may be interested in:{" "}
              <Link href="/what-is-image-prompt" className="text-purple-600 hover:text-purple-700 underline">
                What is an Image Prompt?
              </Link>
              {" "}
              <Link href="/how-to-write-effective-prompt" className="text-purple-600 hover:text-purple-700 underline">
                How to Write Effective Image Prompt?
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Final Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              AI Powered Image Prompt Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A complete suite of AI tools covering every aspect of your image creation journey
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
