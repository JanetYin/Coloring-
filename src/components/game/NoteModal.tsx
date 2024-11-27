import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { HelperNote } from '@/types';


interface HelperNoteModalProps {
  initialNote?: HelperNote;
  onClose: () => void;
  onSave: (note: HelperNote) => void;
}

const HelperNoteModal: React.FC<HelperNoteModalProps> = ({
  initialNote,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(initialNote?.title || '');
  const [content, setContent] = useState(initialNote?.content || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#e6d9bd] p-4 rounded-lg border-4 border-[#937b6a] w-[400px]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-pixel text-[#937b6a]">Helper Note</h2>
          <button
            onClick={onClose}
            className="text-[#937b6a] hover:text-[#6f8b6e]"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[#937b6a] mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 bg-white border-2 border-[#937b6a] rounded font-pixel"
            />
          </div>

          <div>
            <label className="block font-pixel text-[#937b6a] mb-2">Note</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full p-2 bg-white border-2 border-[#937b6a] rounded font-pixel resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#ada387] text-[#e6d9bd] rounded font-pixel
                        border-2 border-[#937b6a] shadow-[2px_2px_0px_#937b6a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#87a985] text-[#e6d9bd] rounded font-pixel
                        border-2 border-[#6f8b6e] shadow-[2px_2px_0px_#6f8b6e]"
            >
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HelperNoteModal;