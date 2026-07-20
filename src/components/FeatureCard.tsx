import React from "react";
import * as LucideIcons from "lucide-react";

interface FeatureCardProps {
  iconName: keyof typeof LucideIcons;
  title: string;
  description: string;
  isComingSoon?: boolean;
}

export default function FeatureCard({ iconName, title, description, isComingSoon }: FeatureCardProps) {
  // Dynamically resolve the Lucide icon component
  const IconComponent = LucideIcons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <div className="group relative flex flex-col p-6 sm:p-8 bg-white border border-border-light rounded-xl hover:border-primary/20 hover:shadow-md transition-all duration-300">
      {/* Icon frame */}
      <div className="flex items-center justify-between">
        <div className="p-3 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-300">
          {IconComponent ? <IconComponent className="h-6 w-6" /> : <LucideIcons.Book className="h-6 w-6" />}
        </div>
        {isComingSoon && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-green/10 text-accent-green border border-accent-green/20">
            Coming Soon
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-foreground mt-6 group-hover:text-primary transition-colors duration-200">
        {title}
      </h3>
      <p className="text-sm text-secondary-gray mt-2 leading-relaxed flex-grow">
        {description}
      </p>
    </div>
  );
}
