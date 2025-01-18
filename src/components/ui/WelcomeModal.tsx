import React, { useState } from 'react';
import { Pixelify_Sans } from 'next/font/google';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const pixelifySans = Pixelify_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

const WelcomeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      title: "Welcome to Your Colorful Journey!",
      content: (
        <div className="space-y-4">
          <p>
            Welcome to a world where thinking transforms from black and white into vibrant colors! Whether through sudden inspiration or persistent exploration, every step of your journey illuminates new discoveries and brings fresh perspectives.
          </p>
          
        </div>
      ),
      image: "/images/tutorial/welcome2.jpg"
    },
    {
        title: "Getting Started",
        content: (
          <div className="space-y-4">
             <p>
            Ready to bring color back to these maps? Each completed challenge becomes a testament to your learning journey - a colorful masterpiece you can showcase through the &apos;Your Adventure Awaits&apos; button!
            </p>
            {/* <ul className="space-y-2">
              <li>• Select your preferred mode to begin</li>
              <li>• In Coloring Mode, follow the pattern guide to restore colors</li>
              <li>• Create and share your own maps in Creating Mode</li>
              <li>• View your completed adventures through the showcase button</li>
            </ul>
            <p className="mt-4 italic">
              Remember: Every color you restore represents a step forward in your journey!
            </p> */}
          </div>
        ),
        image: "/images/tutorial/welcome1.jpg"
    },
    {
      title: "Choose Your Path",
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-bold text-[#87a985]">Creating Mode</h3>
            <p>Design your own puzzle maps! Express your creativity and craft challenges for others to solve.</p>
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-[#87a985]">Coloring Mode</h3>
            <p>Embark on a journey to restore color to the maps, solving puzzles and revealing the hidden beauty within each challenge.</p>
          </div>
        </div>
      ),
      image: "/images/tutorial/mode3.jpg"
    }
    
  ];

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#e6d9bd] border-4 border-[#937b6a] shadow-[8px_8px_0px_#937b6a] rounded-lg w-full max-w-[600px] mx-4">
        <div className="p-6">
          <h2 className={`${pixelifySans.className} text-3xl text-[#87a985] text-center mb-6`}>
            {tutorialSteps[currentStep].title}
          </h2>
          
          <div className="space-y-6">
            <div className="relative w-full h-48 rounded-lg border-2 border-[#937b6a] overflow-hidden">
              <Image
                src={tutorialSteps[currentStep].image}
                alt={tutorialSteps[currentStep].title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            <div className="text-lg text-[#4a3e35] leading-relaxed">
              {tutorialSteps[currentStep].content}
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded-lg ${
                  currentStep === 0
                    ? 'bg-[#a0a0a0] cursor-not-allowed'
                    : 'bg-[#87a985] hover:bg-[#6f8b6e]'
                } text-[#e6d9bd] border-2 border-[#6f8b6e]`}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Previous
              </button>
              
              <div className="flex gap-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      currentStep === index ? 'bg-[#87a985]' : 'bg-[#937b6a]'
                    }`}
                  />
                ))}
              </div>
              
              <button
                onClick={handleNext}
                className="flex items-center px-4 py-2 bg-[#87a985] hover:bg-[#6f8b6e] text-[#e6d9bd] rounded-lg border-2 border-[#6f8b6e]"
              >
                {currentStep === tutorialSteps.length - 1 ? 'Start Adventure' : 'Next'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;