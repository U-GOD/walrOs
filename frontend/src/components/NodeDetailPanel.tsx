"use client";

interface NodeDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Placeholder data — will be replaced with real node data and useWalrusBlob hook in Step 2.6.4
export default function NodeDetailPanel({ isOpen, onClose }: NodeDetailPanelProps) {
  return (
    <aside
      id="rightPanel"
      className={`
        w-full xl:w-96 flex-shrink-0 bg-surface-container-lowest border-hairline-l
        flex flex-col z-40 absolute inset-y-0 right-0 xl:relative
        transition-transform duration-300 shadow-[-4px_0_24px_rgba(0,0,0,0.05)] xl:shadow-none
        transition-cubic
        ${isOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"}
      `}
    >
      {/* Panel Header */}
      <div className="p-md border-hairline-b flex items-center justify-between bg-surface-bright">
        <div className="flex items-center gap-sm">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <h2 className="font-headline-sm text-headline-sm text-primary font-headline-md">
            Node Inspector
          </h2>
        </div>
        <button
          className="xl:hidden p-xs rounded-full hover:bg-surface-container transition-cubic"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto p-gutter flex flex-col gap-xl">
        {/* Blob Metadata Header */}
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline bg-surface-container-low px-2 py-1 rounded inline-block mb-2 font-label-md">
            Blob Metadata
          </span>
          <h3 className="font-headline-md text-headline-md text-primary font-medium mb-1 font-headline-lg-mobile">
            Consensus Mechanism Analysis
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant font-body-lg">
            Extracted concepts regarding epoch boundaries and validator set transitions within
            the Sui network model.
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 gap-y-md border-t border-hairline pt-md">
          {/* Object ID */}
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-label-md">
              Object ID
            </span>
            <div className="flex items-center justify-between bg-[#fafafa] border-hairline p-2 rounded transition-cubic hover:border-outline-variant">
              <span className="font-label-md text-label-md text-primary font-mono truncate mr-2 text-[14px]">
                0x2a9d8f...1234
              </span>
              <button className="text-outline hover:text-primary transition-cubic" title="Copy">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </div>

          {/* Blob ID */}
          <div className="flex flex-col gap-xs">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-label-md">
              Blob ID (Walrus)
            </span>
            <div className="flex items-center justify-between bg-[#fafafa] border-hairline p-2 rounded transition-cubic hover:border-outline-variant">
              <span className="font-label-md text-label-md text-primary font-mono truncate mr-2 text-[14px]">
                wA8_xY2...qP9
              </span>
              <button className="text-outline hover:text-primary transition-cubic" title="Copy">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
              </button>
            </div>
          </div>

          {/* Epoch + Status */}
          <div className="grid grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-label-md">
                Epoch
              </span>
              <span className="font-body-md text-primary font-mono">42</span>
            </div>
            <div className="flex flex-col gap-xs">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-label-md">
                Status
              </span>
              <span className="font-body-md text-primary flex items-center gap-xs font-mono">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Blob Content */}
        <div className="flex flex-col gap-sm">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest font-label-md">
              Extracted Content
            </span>
            <span className="font-label-sm text-label-sm text-primary bg-surface-container px-2 py-0.5 rounded font-label-md">
              JSON
            </span>
          </div>
          <pre className="bg-[#fafafa] border-hairline p-md rounded font-label-md text-label-md text-on-surface overflow-x-auto leading-relaxed transition-cubic hover:border-outline-variant">
{`{
  "topic": "Data Availability",
  "model": "llama3.2:3b",
  "confidence": 0.94,
  "entities": [
    "Validator",
    "Committee",
    "Storage Fund"
  ],
  "summary": "Analysis of storage mechanics..."
}`}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-sm mt-auto pt-md border-t border-hairline">
          <button className="w-full bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest py-3 border border-primary hover:bg-[#222222] transition-cubic">
            View Full Blob
          </button>
          <button className="w-full bg-white text-primary font-label-md text-label-md uppercase tracking-widest py-3 border-hairline hover:bg-surface-container-low transition-cubic">
            Explore Neighbors
          </button>
        </div>
      </div>
    </aside>
  );
}
