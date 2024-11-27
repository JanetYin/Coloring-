import React, { useState, useEffect } from 'react';
import { FileText, TestTube, HelpCircle, Terminal, Send, X, Eye, Check, Palette } from 'lucide-react';
import { PuzzleInfo, TestCase } from '@/types';

const GHCiModal = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] max-w-lg w-full">
      <div className="flex justify-end mb-2">
        <button onClick={onClose} className="text-[#937b6a] hover:text-[#6f8b6e]">
          <X size={20} />
        </button>
      </div>
      <h3 className="text-lg font-bold text-[#937b6a] font-pixel mb-3">Launch GHCi Locally</h3>
      <ol className="list-decimal list-inside space-y-2 text-[#937b6a] font-pixel text-sm">
        <li>Open your terminal/command prompt</li>
        <li>Type <code className="bg-[#1e1e1e] text-[#e6d9bd] px-2 py-1 rounded">ghci</code> and press Enter</li>
        <li>Write or paste your solution</li>
        <li>Test with provided test cases</li>
        <li>Type <code className="bg-[#1e1e1e] text-[#e6d9bd] px-2 py-1 rounded">:quit</code> to exit GHCi</li>
      </ol>
      <button 
        onClick={onClose}
        className="w-full mt-4 px-3 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                  border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e] text-sm"
      >
        Got it!
      </button>
    </div>
  </div>
);
interface PuzzleModalProps {
  puzzle?: PuzzleInfo;
  tileId: string;
  progress?: Set<number>;
  onClose: () => void;
  onSolve: () => void;
  onUpdateProgress: (solvedTests: Set<number>) => void;
}

const PuzzleModal: React.FC<PuzzleModalProps> = ({ 
  puzzle, 
  tileId,
  progress = new Set(),
  onClose, 
  onSolve,
  onUpdateProgress 
}) => {
  const [activeTab, setActiveTab] = useState('description');
  const [solution, setSolution] = useState('');
  const [answer, setAnswer] = useState('');
  const [showGHCi, setShowGHCi] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHiddenTest, setSelectedHiddenTest] = useState<number | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  
  if (!puzzle) return null;

  const visibleTestCases = puzzle.testCases.filter(test => !test.isHidden);
  const hiddenTestCases = puzzle.testCases.filter(test => test.isHidden);

  const allHiddenTestsSolved = hiddenTestCases.length > 0 && 
    hiddenTestCases.every((_, index) => progress.has(index));

    const canRecover = () => {
      // If there are no hidden tests, player can recover after reading
      if (hiddenTestCases.length === 0) {
        return true;
      }
      // If there are hidden tests, all must be solved
      return allHiddenTestsSolved;
    };  
  const handleSubmit = () => {
    if (!answer.trim() || selectedHiddenTest === null) {
      setError('Please enter an answer and select a hidden test to verify');
      return;
    }

    const currentTest = hiddenTestCases[selectedHiddenTest];
    const isCorrect = answer.trim().toLowerCase() === currentTest.expectedOutput.trim().toLowerCase();

    if (isCorrect) {
      const newProgress = new Set(progress);
      newProgress.add(selectedHiddenTest);
      onUpdateProgress(newProgress);
      setAnswer('');
      setError(null);
      
      // Check if this was the last test case
      const updatedProgress = new Set([...newProgress]);
      if (hiddenTestCases.every((_, index) => updatedProgress.has(index))) {
        // If all tests are solved, call onSolve and close the modal
        onSolve();
        onClose();
      }
    } else {
      setError('Incorrect answer. Please try again.');
    }
  };

  const toggleHint = (index: number) => {
    const newRevealedHints = new Set(revealedHints);
    if (revealedHints.has(index)) {
      newRevealedHints.delete(index);
    } else {
      newRevealedHints.add(index);
    }
    setRevealedHints(newRevealedHints);
  };

  const handleRecoverArea = () => {
    if (!canRecover()) {
      setError('This area requires hidden tests to be solved');
      return;
    }
    onSolve();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] w-[800px] h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold font-pixel text-[#937b6a]">Puzzle Challenge</h2>
          <button onClick={onClose} className="text-[#937b6a] hover:text-[#6f8b6e]">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex flex-col gap-3 flex-1 min-h-0">
          <div className="flex gap-3 mb-2">
            {[
              { id: 'description', icon: <FileText size={16} />, label: 'Task' },
              { id: 'example', icon: <TestTube size={16} />, label: 'Examples' },
              { id: 'hidden', icon: <Eye size={16} />, label: 'Hidden Tests' },
              { id: 'hints', icon: <HelpCircle size={16} />, label: 'Hints' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded font-pixel flex items-center gap-2 text-sm
                  ${activeTab === tab.id
                    ? 'bg-[#87a985] text-[#e6d9bd] border-2 border-[#6f8b6e]'
                    : 'bg-[#e6d9bd] text-[#937b6a] border-2 border-[#937b6a]'
                  }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'hidden' && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-[#6f8b6e] text-[#e6d9bd] text-xs">
                    {progress.size}/{hiddenTestCases.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3 flex-1 min-h-0">
            {/* Left Panel */}
            <div className="w-1/2 flex flex-col bg-[#f5ecd5] rounded-lg p-3 border-2 border-[#937b6a]">
              <div className="flex-1 overflow-y-auto">
                {activeTab === 'description' && (
                  <div className="p-3 bg-[#1e1e1e] rounded-lg text-[#e6d9bd] font-pixel text-sm">
                    {puzzle.description}
                  </div>
                )}

                {activeTab === 'example' && (
                  <div className="space-y-2">
                    {visibleTestCases.map((test, index) => (
                      <div key={index} className="p-3 bg-[#1e1e1e] rounded text-[#e6d9bd] font-mono text-sm">
                        <div className="text-yellow-500 mb-2 font-pixel">Example {index + 1}</div>
                        <div>Input: {test.input}</div>
                        <div>Output: {test.expectedOutput}</div>
                      </div>
                    ))}
                  </div>
                )}

              {activeTab === 'hidden' && (
                    <div className="space-y-2">
                      {hiddenTestCases.map((test, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedHiddenTest(index)}
                          className={`w-full p-3 bg-[#1e1e1e] rounded text-left font-mono text-sm
                            ${selectedHiddenTest === index ? 'border-2 border-yellow-500' : ''}
                            ${progress.has(index) ? 'border-2 border-green-500' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[#e6d9bd] font-pixel">Hidden Test {index + 1}</span>
                            {progress.has(index) && (
                              <Check className="text-green-500" size={16} />
                            )}
                          </div>
                          <div className="text-[#e6d9bd]">Input: {test.input}</div>
                          {progress.has(index) && (
                            <div className="text-green-500 mt-1">
                              Output: {test.expectedOutput}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                {activeTab === 'hints' && (
                  <div className="space-y-3">
                    {puzzle.hints.map((hint, i) => (
                      <div key={i} className="relative">
                        <button
                          onClick={() => toggleHint(i)}
                          className={`w-full p-3 rounded-lg font-pixel text-sm flex items-center justify-between
                            ${revealedHints.has(i)
                              ? 'bg-[#1e1e1e] text-[#e6d9bd] border border-[#87a985]'
                              : 'bg-[#2d2d2d] text-[#937b6a] border border-[#937b6a]'
                            }`}
                        >
                          <span>{revealedHints.has(i) ? hint : `Hint ${i + 1}`}</span>
                          <Eye size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="w-1/2 flex flex-col bg-[#1e1e1e] rounded-lg p-3 border-2 border-[#937b6a]">
              <textarea
                className="flex-1 p-3 bg-[#2d2d2d] text-[#e6d9bd] font-mono rounded border-none resize-none mb-3 text-sm"
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Write your solution here..."
              />
              <div className="space-y-2">
                {activeTab === 'hidden' && selectedHiddenTest !== null && (
                  <div className="bg-[#2d2d2d] p-2 rounded border border-yellow-500">
                    <div className="text-yellow-500 font-pixel text-sm mb-1">
                      Solving Hidden Test {selectedHiddenTest + 1}
                    </div>
                    <div className="text-[#e6d9bd] font-mono text-sm">
                      Input: {hiddenTestCases[selectedHiddenTest].input}
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  className="w-full p-2 bg-[#2d2d2d] text-[#e6d9bd] font-mono rounded border-2 border-[#937b6a] text-sm"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={activeTab === 'hidden' 
                    ? (selectedHiddenTest !== null 
                      ? "Enter the output for this test case..."
                      : "Select a hidden test to solve...")
                    : "Switch to Hidden Tests tab to solve the puzzle"
                  }
                  disabled={activeTab !== 'hidden' || selectedHiddenTest === null || progress.has(selectedHiddenTest)}
                />
                {error && (
                  <div className="text-red-500 font-pixel text-sm p-2 bg-red-950 rounded">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div className="text-sm font-pixel text-[#937b6a]">
              {/* Remove the "No hidden tests" message since it's not an error state */}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowGHCi(true)}
                className="px-4 py-2 bg-[#1e1e1e] text-[#e6d9bd] rounded font-pixel border-2 border-[#937b6a] flex items-center gap-2 text-sm"
              >
                <Terminal size={16} />
                Launch GHCi
              </button>
              {activeTab === 'hidden' && !allHiddenTestsSolved && hiddenTestCases.length > 0 && (
                <button 
                  onClick={handleSubmit}
                  disabled={selectedHiddenTest === null || progress.has(selectedHiddenTest)}
                  className={`px-4 py-2 rounded font-pixel flex items-center gap-2 text-sm
                    ${selectedHiddenTest !== null && !progress.has(selectedHiddenTest)
                      ? 'bg-[#87a985] text-[#e6d9bd] border-2 border-[#6f8b6e]'
                      : 'bg-gray-500 text-gray-300 border-2 border-gray-600 cursor-not-allowed'
                    }`}
                >
                  <Send size={16} />
                  Submit Answer
                </button>
              )}
              {canRecover() && (
                <button 
                  onClick={() => {
                    onSolve();
                    onClose();
                  }}
                  className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel border-2 border-[#6f8b6e] flex items-center gap-2 text-sm animate-pulse"
                >
                  <Palette size={16} />
                  Color!
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showGHCi && <GHCiModal onClose={() => setShowGHCi(false)} />}
    </div>
  );
};

export default PuzzleModal;