"use client";

import { useEffect, useState } from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';

interface ProductTourProps {
  tourKey: string;
  steps: Step[];
}

export function ProductTour({ tourKey, steps }: ProductTourProps) {
  const [run, setRun] = useState(false);

  useEffect(() => {
    // Check if the user has already seen this specific tour
    const hasSeenTour = localStorage.getItem(`tour_${tourKey}`);
    
    if (!hasSeenTour) {
      // Small delay to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [tourKey]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    // If the user completes or skips the tour, mark it as seen
    if (finishedStatuses.includes(status)) {
      localStorage.setItem(`tour_${tourKey}`, 'true');
      setRun(false);
    }
  };

  if (!run) return null;

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#641BC4',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left',
          fontFamily: 'inherit',
        },
        buttonNext: {
          backgroundColor: '#641BC4',
          borderRadius: '8px',
          padding: '8px 16px',
        },
        buttonBack: {
          color: '#64748b',
          marginRight: '8px',
        },
        buttonSkip: {
          color: '#94a3b8',
        }
      }}
    />
  );
}
