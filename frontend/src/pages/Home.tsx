import React from "react";
import { Code2, Zap, Palette, Layout, GitBranch } from "lucide-react";
import { PromptInput } from "../components/PromptInput";

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-gray-800 p-6 rounded-xl">
      <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4">
        <Icon size={24} className="text-blue-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

export function Home() {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center">
      <div className="w-full max-w-6xl px-6 py-20">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse bg-blue-500/20 rounded-full blur-xl"></div>
              <Code2 size={64} className="text-blue-500 relative" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Website Generator
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-12">
            Transform your ideas into reality with AI-powered website
            generation. Just describe what you want, and watch your website come
            to life in seconds.
          </p>
          <PromptInput />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard
            icon={Zap}
            title="Instant Generation"
            description="Get a fully functional website in seconds using natural language descriptions"
          />
          <FeatureCard
            icon={Layout}
            title="Complete Structure"
            description="Generates all necessary files, components, and styles automatically"
          />
          <FeatureCard
            icon={Palette}
            title="Modern Design"
            description="Beautiful, responsive layouts with Tailwind CSS styling"
          />
          <FeatureCard
            icon={GitBranch}
            title="Code Control"
            description="Full access to generated code with real-time preview and editing"
          />
        </div>

        <div className="mt-20 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Powered by Advanced AI
          </div>
        </div>
      </div>
    </div>
  );
}
