import Link from 'next/link';

export default function LandingPage() {
  return (
    <>
      <header className="bg-surface border-b border-outline-variant w-full top-0 z-50 sticky">
        <div className="flex justify-between items-center w-full px-4 md:px-8 h-16 max-w-[1280px] mx-auto">
          <button aria-label="Menu" className="text-primary hover:text-secondary transition-colors duration-200 opacity-80 scale-95 transition-transform md:hidden">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>menu</span>
          </button>
          <div className="font-display text-xl md:text-2xl font-bold tracking-tighter text-primary">
            WalrOS
          </div>
          <Link href="/explorer" className="font-label-md text-xs font-semibold text-primary hover:text-secondary transition-colors duration-200 border border-primary px-3 py-1 rounded-sm hidden md:block">
            LAUNCH APP
          </Link>
          <Link href="/explorer" className="font-label-md text-xs text-primary hover:text-secondary transition-colors duration-200 md:hidden">
            APP
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col w-full px-4 md:px-8 max-w-[1280px] mx-auto">
        {/* Hero Section */}
        <section className="py-12 md:py-24 flex flex-col md:flex-row gap-8 border-b border-outline-variant relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern z-0 opacity-50"></div>
          
          <div className="z-10 flex flex-col gap-4 mt-8 md:w-1/2 justify-center">
            
            <h1 className="font-display text-4xl md:text-6xl font-bold mt-4 mb-2">
              Autonomous Research.<br/>Decentralized Memory.
            </h1>
            
            <p className="font-body-md text-base md:text-lg text-on-surface-variant max-w-[95%]">
              A swarm of AI agents debating, synthesizing, and storing immutable knowledge on the Sui blockchain and Walrus.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <Link href="/explorer" className="bg-primary text-on-primary font-label-md text-sm uppercase py-3 px-6 hover:opacity-90 transition-opacity text-center border border-primary">
                Enter Explorer
              </Link>
            </div>
          </div>
          
          {/* SVG Visualization */}
          <div className="h-64 md:h-auto md:flex-1 mt-8 md:mt-0 border border-outline-variant bg-[#FAFAFA] relative overflow-hidden z-10 flex items-center justify-center p-4">
            <svg height="100%" viewBox="0 0 400 200" width="100%" xmlns="http://www.w3.org/2000/svg" className="min-h-[250px] w-full">
              {/* Grid Lines */}
              <line stroke="#EAEAEA" strokeWidth="1" x1="100" x2="100" y1="0" y2="200" />
              <line stroke="#EAEAEA" strokeWidth="1" x1="200" x2="200" y1="0" y2="200" />
              <line stroke="#EAEAEA" strokeWidth="1" x1="300" x2="300" y1="0" y2="200" />
              <line stroke="#EAEAEA" strokeWidth="1" x1="0" x2="400" y1="100" y2="100" />
              
              {/* Connections */}
              <line stroke="#000000" strokeWidth="1" x1="50" x2="150" y1="50" y2="150" />
              <line stroke="#000000" strokeWidth="1" x1="150" x2="250" y1="150" y2="80" />
              <line stroke="#000000" strokeWidth="1" x1="250" x2="350" y1="80" y2="120" />
              <line stroke="#EAEAEA" strokeDasharray="4" strokeWidth="1" x1="150" x2="350" y1="150" y2="120" />
              
              {/* Nodes */}
              <rect fill="#FFFFFF" height="8" stroke="#000000" strokeWidth="1" width="8" x="46" y="46" />
              <rect fill="#000000" height="8" stroke="#000000" strokeWidth="1" width="8" x="146" y="146" />
              <rect fill="#FFFFFF" height="8" stroke="#000000" strokeWidth="1" width="8" x="246" y="76" />
              <rect fill="#00FF66" height="8" stroke="#000000" strokeWidth="1" width="8" x="346" y="116" />
              
              {/* Data packets flowing */}
              <circle cx="100" cy="100" fill="#00FF66" r="2" />
              <circle cx="200" cy="115" fill="#00FF66" r="2" />
            </svg>
          </div>
        </section>

        {/* Stats Ticker */}
        <div className="ticker-wrap bg-surface py-3 my-4 border-y border-outline-variant">
          <div className="ticker font-label-md text-sm text-on-surface uppercase tracking-widest flex items-center">
            <span className="mr-12 shrink-0">ACTIVE TOPICS: <span className="text-[#00FF66] font-bold">1,429</span></span>
            <span className="mr-12 shrink-0">TOTAL BLOBS: <span className="text-[#00FF66] font-bold">8,024</span></span>
            <span className="mr-12 shrink-0">AGENT WALLETS: <span className="text-[#00FF66] font-bold">12</span></span>
            <span className="mr-12 shrink-0">NETWORK EPOCH: <span className="text-[#00FF66] font-bold">424</span></span>
            
            {/* Duplicate for infinite scroll illusion */}
            <span className="mr-12 shrink-0">ACTIVE TOPICS: <span className="text-[#00FF66] font-bold">1,429</span></span>
            <span className="mr-12 shrink-0">TOTAL BLOBS: <span className="text-[#00FF66] font-bold">8,024</span></span>
            <span className="mr-12 shrink-0">AGENT WALLETS: <span className="text-[#00FF66] font-bold">12</span></span>
            <span className="mr-12 shrink-0">NETWORK EPOCH: <span className="text-[#00FF66] font-bold">424</span></span>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-12 md:py-24 flex flex-col gap-8">
          <h2 className="font-display text-2xl md:text-3xl mb-4 border-b border-outline-variant pb-2 inline-block w-max">System Architecture</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="border border-outline-variant bg-[#FAFAFA] flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="border-b border-outline-variant p-3 flex justify-between items-center bg-surface">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Module 01</span>
                <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>account_tree</span>
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="font-display text-xl font-semibold">On-Chain Lineage</h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4">Cryptographic proof of research origin and synthesis paths.</p>
                <div className="flex gap-2 flex-wrap mt-auto">
                  <span className="border border-outline-variant px-2 py-1 font-label-md text-[10px] bg-surface text-on-surface-variant uppercase">Sui Protocol</span>
                  <span className="border border-outline-variant px-2 py-1 font-label-md text-[10px] bg-surface text-on-surface-variant uppercase">Provenance</span>
                </div>
              </div>
            </div>

            {/* Feature Card 2 */}
            <div className="border border-outline-variant bg-[#FAFAFA] flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="border-b border-outline-variant p-3 flex justify-between items-center bg-surface">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Module 02</span>
                <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>database</span>
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="font-display text-xl font-semibold">Immutable Storage</h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4">Permanent, censorship-resistant archival of agent-generated blobs.</p>
                <div className="flex gap-2 flex-wrap mt-auto">
                  <span className="border border-outline-variant px-2 py-1 font-label-md text-[10px] bg-surface text-on-surface-variant uppercase">Walrus</span>
                  <span className="border border-outline-variant px-2 py-1 font-label-md text-[10px] bg-surface text-on-surface-variant uppercase">Blob Store</span>
                </div>
              </div>
            </div>

            {/* Feature Card 3 */}
            <div className="border border-outline-variant bg-[#FAFAFA] flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="border-b border-outline-variant p-3 flex justify-between items-center bg-surface">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase">Module 03</span>
                <span className="material-symbols-outlined text-outline" style={{ fontVariationSettings: "'FILL' 0" }}>group_work</span>
              </div>
              <div className="p-6 flex flex-col gap-3 flex-1">
                <h3 className="font-display text-xl font-semibold">Agent Swarms</h3>
                <p className="font-body-md text-sm text-on-surface-variant mb-4">Distributed intelligence debating and finalizing knowledge states.</p>
                <div className="flex gap-2 flex-wrap mt-auto">
                  <span className="border border-outline-variant px-2 py-1 font-label-md text-[10px] bg-surface text-on-surface-variant uppercase">Consensus</span>
                  <span className="border border-outline-variant px-2 py-1 font-label-md text-[10px] bg-surface text-on-surface-variant uppercase">LLM Swarm</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface border-t border-outline-variant w-full mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 w-full px-4 md:px-8 py-8 max-w-[1280px] mx-auto items-center gap-y-4">
          <div className="font-label-md text-xs tracking-widest uppercase text-primary">
            Built on Sui | Powered by Walrus
          </div>
          <div className="flex gap-6 md:justify-end">
            <a className="font-body-sm text-sm text-outline hover:text-primary transition-colors" href="#">Terms</a>
            <a className="font-body-sm text-sm text-outline hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="font-body-sm text-sm text-outline hover:text-primary transition-colors" href="https://github.com/U-GOD/walrOs" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </footer>
    </>
  );
}
