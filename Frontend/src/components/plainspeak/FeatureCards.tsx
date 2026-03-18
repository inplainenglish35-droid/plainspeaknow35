import React from 'react';
import { 
  BookOpen, 
  Languages, 
  Volume2, 
  Camera, 
  Download, 
  Smartphone,
  Zap,
  Shield
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const features: Feature[] = [
  {
    icon: <BookOpen className="w-6 h-6" />,
    title: 'Plain Language',
    description: 'Transform complex text into clear, simple words anyone can understand.',
    color: 'from-teal-500 to-teal-600',
  },

  {
    icon: <Languages className="w-6 h-6" />,
    title: 'Bilingual Support',
    description: 'Translate seamlessly between English and Spanish with one click.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Volume2 className="w-6 h-6" />,
    title: 'Audio Playback',
    description: 'Listen to text read aloud with word highlighting and speed control.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: 'OCR Extraction',
    description: 'Extract text from images and photos using advanced AI recognition.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: <Download className="w-6 h-6" />,
    title: 'Export & Download',
    description: 'Save simplified text as files or copy to clipboard instantly.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: <Smartphone className="w-6 h-6" />,
    title: 'Install as App',
    description: 'Add to your home screen for quick access, works offline too.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Fast & Reliable',
    description: 'Powered by advanced AI for quick, accurate text processing.',
    color: 'from-yellow-500 to-yellow-600',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Accessible Design',
    description: 'Built with WCAG guidelines for screen readers and keyboard navigation.',
    color: 'from-indigo-500 to-indigo-600',
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
          Powerful features designed to make information accessible to everyone
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className={cn(
              'group relative bg-white dark:bg-gray-800 rounded-xl p-5',
              'border border-gray-200 dark:border-gray-700',
              'hover:shadow-lg hover:border-teal-300 dark:hover:border-teal-600',
              'transition-all duration-300'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center mb-4',
                'bg-gradient-to-br text-white',
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
