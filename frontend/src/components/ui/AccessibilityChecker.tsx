'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import * as accessibilityUtils from '@/lib/utils/accessibilityChecker';

interface AccessibilityCheckerProps {
  targetSelector?: string;
  autoRun?: boolean;
  showOnLoad?: boolean;
}

export const AccessibilityChecker: React.FC<AccessibilityCheckerProps> = ({
  targetSelector = '#root',
  autoRun = false,
  showOnLoad = false,
}) => {
  const [isVisible, setIsVisible] = useState(showOnLoad);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    valid: boolean;
    issues: { [category: string]: string[] };
  } | null>(null);

  // Run accessibility checks
  const runChecks = () => {
    setIsRunning(true);
    
    // Small delay to allow UI to update
    setTimeout(() => {
      try {
        const targetElement = document.querySelector(targetSelector);
        
        if (!targetElement) {
          throw new Error(`Target element not found: ${targetSelector}`);
        }
        
        // Get all elements for checks
        const headings = Array.from(targetElement.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const images = Array.from(targetElement.querySelectorAll('img'));
        const interactiveElements = Array.from(targetElement.querySelectorAll('button, a, [role="button"], [tabindex], input, select, textarea'));
        const allElements = Array.from(targetElement.querySelectorAll('*'));
        
        // Run checks
        const headingResults = accessibilityUtils.checkHeadingStructure(headings as HTMLHeadingElement[]);
        const imageResults = accessibilityUtils.checkImageAltText(images as HTMLImageElement[]);
        const ariaResults = accessibilityUtils.checkAriaAttributes(allElements);
        const keyboardResults = accessibilityUtils.checkKeyboardAccessibility(interactiveElements);
        
        // Combine results
        setResults({
          valid: headingResults.valid && imageResults.valid && ariaResults.valid && keyboardResults.valid,
          issues: {
            headings: headingResults.issues,
            images: imageResults.issues,
            aria: ariaResults.issues,
            keyboard: keyboardResults.issues,
          }
        });
      } catch (error) {
        setResults({
          valid: false,
          issues: {
            error: [(error as Error).message]
          }
        });
      } finally {
        setIsRunning(false);
      }
    }, 100);
  };

  // Auto-run on mount if enabled
  useEffect(() => {
    if (autoRun) {
      runChecks();
    }
  }, [autoRun]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        aria-label="Open Accessibility Checker"
      >
        <AlertTriangle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-w-[calc(100vw-2rem)]">
      <ZPCard className="p-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">WCAG AA Compliance Checker</h3>
          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close accessibility checker"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4">
          <ZPButton
            onClick={runChecks}
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? 'Running Checks...' : 'Run Accessibility Checks'}
          </ZPButton>
        </div>

        {results && (
          <div className="mt-4">
            <div className={`p-3 rounded-lg mb-4 ${results.valid ? 'bg-green-100' : 'bg-red-100'}`}>
              <div className="flex items-center">
                {results.valid ? (
                  <CheckCircle className="text-green-600 mr-2" size={20} />
                ) : (
                  <AlertTriangle className="text-red-600 mr-2" size={20} />
                )}
                <span className={results.valid ? 'text-green-800' : 'text-red-800'}>
                  {results.valid ? 'All checks passed!' : 'Accessibility issues found'}
                </span>
              </div>
            </div>

            {!results.valid && (
              <div className="max-h-60 overflow-y-auto">
                {Object.entries(results.issues).map(([category, issues]) => (
                  issues.length > 0 && (
                    <div key={category} className="mb-4">
                      <h4 className="font-medium mb-2 capitalize">{category}</h4>
                      <ul className="list-disc pl-5 text-sm">
                        {issues.map((issue, index) => (
                          <li key={index} className="mb-1 text-gray-700">{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </ZPCard>
    </div>
  );
};

export default AccessibilityChecker;