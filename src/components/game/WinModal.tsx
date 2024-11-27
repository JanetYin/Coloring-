import { useRouter } from 'next/navigation';

interface WinModalProps {
    onClose: () => void;
    onContinueExploring: () => void;
  }

const WinModal: React.FC<WinModalProps> = ({ 
  onClose, 
  onContinueExploring, 
}) => {
  const router = useRouter();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#e6d9bd] p-8 rounded-lg border-4 border-[#937b6a] max-w-md w-full text-center">
        <h2 className="text-3xl font-bold font-pixel text-[#87a985] mb-6">🎉 Victory! 🎉</h2>
        <p className="text-lg font-pixel text-[#937b6a] mb-8">You've solved all puzzles!</p>
        <p className="text-md font-pixel text-[#937b6a] mb-4">
          Drawing mode and exports are now unlocked! Continue exploring to decorate the map.
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                       border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]"
            >
              Back to Menu
            </button>
            <button
              onClick={() => {
                onContinueExploring();
                onClose();
              }}
              className="px-6 py-3 bg-[#ada387] text-[#e6d9bd] rounded font-pixel
                       border-2 border-[#937b6a] shadow-[2px_2px_0px_#937b6a]"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinModal;