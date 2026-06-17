import { useState } from "react";
import { createTopic } from "@/lib/api-client";

interface CreateTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated?: (topicId: string) => void;
}

export default function CreateTopicModal({ isOpen, onClose, onTopicCreated }: CreateTopicModalProps) {
  const [topicText, setTopicText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicText.trim()) return;

    setLoading(true);
    setError(null);
    setSuccessId(null);

    try {
      const { topicId } = await createTopic(topicText);
      setSuccessId(topicId);
      if (onTopicCreated) {
        onTopicCreated(topicId);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while creating the topic.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTopicText("");
    setError(null);
    setSuccessId(null);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface border border-outline-variant shadow-lg max-w-md w-full relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-surface-container-low">
          <h2 className="font-display text-xl font-semibold text-primary">Propose Research Topic</h2>
          <button
            onClick={handleClose}
            className="text-on-surface-variant hover:text-primary transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {successId ? (
            <div className="flex flex-col items-center justify-center text-center gap-4 py-4">
              <span className="material-symbols-outlined text-[#00FF66] text-5xl">check_circle</span>
              <div className="font-display text-xl font-semibold">Topic Created!</div>
              <p className="font-body-md text-sm text-on-surface-variant">
                Your research topic has been registered on the Sui blockchain.
              </p>
              <div className="bg-surface-container-low p-3 border border-outline-variant w-full font-mono text-xs break-all text-left text-on-surface-variant mt-2">
                <div className="font-label-md text-[10px] uppercase text-outline mb-1">Topic ID</div>
                {successId}
              </div>
              <button
                onClick={handleClose}
                className="mt-4 w-full bg-primary text-on-primary font-label-md uppercase tracking-wider py-3 text-sm hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="topicText" className="font-label-md text-sm uppercase tracking-wider text-primary">
                  Topic Description
                </label>
                <textarea
                  id="topicText"
                  value={topicText}
                  onChange={(e) => setTopicText(e.target.value)}
                  placeholder="e.g., Is SUI structurally undervalued in 2026?"
                  className="w-full bg-surface-container-low border border-outline-variant p-3 font-body-md text-primary min-h-[100px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-y"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-error/10 text-error border border-error/20 p-3 font-body-md text-sm flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !topicText.trim()}
                className="mt-2 w-full bg-primary text-on-primary font-label-md uppercase tracking-wider py-3 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                    Processing Transaction...
                  </>
                ) : (
                  <>Create Topic</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
