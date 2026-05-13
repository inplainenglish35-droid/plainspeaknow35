import React from "react";
import {
  BookOpen,
  Languages,
  Volume2,
  FileText,
  Download,
  Shield,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: "Plain Language",
    description:
      "Turn confusing documents into clear words you can understand.",
    color: "from-teal-500 to-teal-600",
  },
  {
    icon: <Languages className="w-6 h-6" />,
    title: "Translation Support",
    description:
      "Simplify first, then translate when another language is selected.",
    color: "from-blue-500 to-blue-600",
  },
  {
    icon: <Volume2 className="w-6 h-6" />,
    title: "Audio Playback",
    description:
      "Listen to your simplified result when reading feels like too much.",
    color: "from-purple-500 to-purple-600",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Text-Based Documents",
    description:
      "Supports PDF, TXT, DOCX, CSV, and XLSX. Photos and screenshots are not supported.",
    color: "from-slate-500 to-slate-600",
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: "Copy & Save",
    description:
      "Copy your simplified result or save it for later reference.",
    color: "from-orange-500 to-orange-600",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Built for Clarity",
    description:
      "Designed to help people understand stressful documents without extra noise.",
    color: "from-indigo-500 to-indigo-600",
  },
];

export const FeatureCards: React.FC = () => {
  return (
    <section className="py-12" aria-labelledby="features-heading">
      <div className="text-center mb-10">
        <h2
          id="features-heading"
          className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3"
        >
          Everything You Need
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Simple tools for turning hard-to-understand documents into clear,
          useful information.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              "group relative bg-white dark:bg-gray-800 rounded-xl p-5",
              "border border-gray-200 dark:border-gray-700",
              "hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600",
              "transition-all duration-300"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                "bg-gradient-to-br text-white",
                feature.color
              )}
            >
              {feature.icon}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              {feature.title}
            </h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
