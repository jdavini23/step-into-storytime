import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PricingCardProps, FeatureKey } from '@/types/pricing';
import { FEATURE_DESCRIPTIONS } from '@/constants/pricing';

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  color,
  icon,
  accentColor,
  buttonColor,
  highlighted = false,
  isLoading = false,
  onButtonClick,
}: PricingCardProps) {
  return (
    <div
      role="listitem"
      aria-label={`${title} Plan`}
      className={`relative ${highlighted ? 'mt-6' : ''}`}
    >
      {highlighted && (
        <div
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-violet-600 text-white px-6 py-1.5 rounded-full text-sm font-semibold shadow-lg shadow-violet-200/50 z-10 animate-bounce-subtle ring-2 ring-violet-200"
          aria-label="Popular plan badge"
        >
          Popular
        </div>
      )}
      <div
        className={`rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl focus-within:ring-2 focus-within:ring-violet-500 ${
          highlighted ? 'ring-2 ring-violet-500 shadow-2xl' : 'shadow-xl'
        }`}
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onButtonClick();
          }
        }}
      >
        <div
          className={`${color} p-6 text-center border-b ${accentColor} transition-colors duration-300`}
        >
          <div
            className="mx-auto bg-white rounded-full h-16 w-16 flex items-center justify-center mb-4 shadow-md"
            aria-hidden="true"
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <div className="mb-4">
            <span className="text-3xl font-bold text-slate-900">{price}</span>
            {period && (
              <span
                className="text-slate-600"
                aria-label={`per ${period.replace('/', '')}`}
              >
                {period}
              </span>
            )}
          </div>
          <p className="text-slate-600 mb-4">{description}</p>
        </div>
        <div className="bg-white p-6">
          <ul
            className="space-y-4 mb-6"
            role="list"
            aria-label={`${title} plan features`}
          >
            {features.map((feature, index) => (
              <li
                key={index}
                className="flex items-start text-slate-700 relative group"
                role="listitem"
              >
                <div
                  className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 group-hover:bg-violet-100 transition-colors duration-200"
                  aria-hidden="true"
                >
                  <Star
                    className="h-3 w-3 text-violet-600"
                    fill="currentColor"
                  />
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="text-left hover:text-violet-700 cursor-help transition-colors duration-200">
                      {feature}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="top"
                    align="start"
                    className="z-50 bg-white px-3 py-2 rounded-lg shadow-lg border border-slate-200 max-w-[250px]"
                  >
                    <p className="text-sm text-slate-700">
                      {FEATURE_DESCRIPTIONS[feature as FeatureKey]}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </li>
            ))}
          </ul>
          <Button
            className={`w-full ${buttonColor} text-white relative transition-all duration-200`}
            onClick={onButtonClick}
            disabled={isLoading}
            aria-label={`Select ${title} plan`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2" />
                Processing...
              </div>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
