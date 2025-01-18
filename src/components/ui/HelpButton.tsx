import React, { useState } from 'react';
import { HelpCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pixelify_Sans } from 'next/font/google';
import { EditorMode } from '@/types';

const pixelifySans = Pixelify_Sans({ subsets: ['latin'], weight: ['400', '500', '700'] });

const HelpButton = ({ mode }: { mode: EditorMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const helpContent = {
    home: {
      title: "Getting Started",
      pages: [{
        content: (
          <div className="space-y-4">
            <p>Welcome to Coloring! Choose your adventure:</p>
            <div className="space-y-2">
              <h3 className="font-bold text-[#87a985]">Creating Mode</h3>
              <p>Design your own pixel art maps and share them with friends.</p>
              
              <h3 className="font-bold text-[#87a985]">Coloring Mode</h3>
              <p>Solve colorful puzzles by matching patterns and completing maps.</p>
            </div>
          </div>
        )
      }]
    },
    creating: {
      title: "Creating Mode Help",
      pages: [
        {
          content: (
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#87a985] mb-2">Mode Buttons</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Preview Mode: See how your map looks without colors</li>
                    <li>Background: Create your pixel art patterns</li>
                    <li>Interactive: Place puzzles and recovery areas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-[#87a985] mb-2">Drawing Tools</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Pencil (P): Draw on the grid</li>
                    <li>Eraser (E): Remove pixels</li>
                    <li>Color Palette: Choose from existing colors</li>
                    <li>+ Button: Add new colors to your palette</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-[#87a985] mb-2">Saving & Loading</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Save Map: Store your current work</li>
                    <li>Load Map: Continue working on previous designs</li>
                    <li>You can save work-in-progress and finish it later</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-[#87a985] mb-2">Tips</h3>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Middle-click and drag to pan around the grid</li>
                    <li>Create patterns in the background layer first</li>
                    <li>Use Preview Mode to see how players will view your map</li>
                    <li>Add interactive elements after completing the background</li>
                  </ul>
                </div>
              </div>
            </div>
          )
        },
        {
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Interactive Layer</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Click any cell to place a puzzle</li>

                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Puzzle Components</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><span className="font-semibold">Description:</span> Write the main puzzle task</li>
                  <li><span className="font-semibold">Hints:</span> Add helpful clues for players</li>
                  <li><span className="font-semibold">Test Cases:</span> Create visible and hidden tests for verifying solutions</li>  </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Managing Puzzles</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li><span className="font-semibold">Edit Puzzle:</span> Modify puzzle content anytime</li>
                  <li><span className="font-semibold">Set Recovery Area:</span> Define the region players need to color</li>
                  <li><span className="font-semibold">Remove:</span> Delete the puzzle if needed</li>
                </ul>
              </div>

              <div className="mt-4 text-sm text-[#6f8b6e] italic">
                Tip: Make sure to save your map after adding or editing puzzles!
              </div>
            </div>
          )
        }
      ]
    },
    coloring: {
      title: "Coloring Mode Help",
      pages: [
        {
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Getting Started</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Select from available maps or upload your own</li>
                  <li>Design your player character in the editor</li>
                  <li>Click "Start Game" to begin</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Basic Controls</h3>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Player: Place your character on the map</li>
                    <li>Draw: Available after completing all puzzles</li>
                    <li>Helper: Take notes for puzzles</li>
                    <li>Hide Notes: Toggle note visibility</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          content: (
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Puzzle Solving</h3>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Look for tiles glowing in red - they contain hidden puzzles</li>
                  <li>Solving each puzzle restores colors to parts of the map</li>
                  <li>Use the Helper button to take notes while solving</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-[#87a985]">Victory Rewards</h3>
                <ul className="list-disc pl-4 space-y-1">
                    <li>Drawing mode unlocks after completing all puzzles</li>
                    <li>Export your colorful map as PNG</li>
                    <li>Save as JSON file to showcase in the Home page</li>
                </ul>

                <div className="mt-4 text-sm text-[#6f8b6e] italic">
                  Tip: Your progress is automatically saved as you play. Feel free to take breaks and come back later!
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#87a985] hover:bg-[#6f8b6e] border-4 border-[#6f8b6e] shadow-[4px_4px_0px_#6f8b6e] flex items-center justify-center"
      >
        <HelpCircle className="w-6 h-6 text-[#e6d9bd]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#e6d9bd] border-4 border-[#937b6a] shadow-[8px_8px_0px_#937b6a] rounded-lg w-full max-w-[500px] mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`${pixelifySans.className} text-2xl text-[#87a985]`}>
                  {helpContent[mode].title}
                </h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-[#937b6a] hover:text-[#6f8b6e]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="text-[#4a3e35]">
                {helpContent[mode].pages[currentStep].content}
              </div>
              
              {helpContent[mode].pages.length > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setCurrentStep(0)}
                    disabled={currentStep === 0}
                    className={`flex items-center px-3 py-1 rounded ${
                      currentStep === 0
                        ? 'text-[#937b6a] cursor-not-allowed'
                        : 'text-[#87a985] hover:text-[#6f8b6e]'
                    }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {helpContent[mode].pages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          currentStep === index ? 'bg-[#87a985]' : 'bg-[#937b6a]'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentStep(1)}
                    disabled={currentStep === 1}
                    className={`flex items-center px-3 py-1 rounded ${
                      currentStep === 1
                        ? 'text-[#937b6a] cursor-not-allowed'
                        : 'text-[#87a985] hover:text-[#6f8b6e]'
                    }`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpButton;