export default function Header() {
  return (
    <header className="bg-surface/95 backdrop-blur-md text-primary font-headline-sm text-headline-sm tracking-tight fixed top-0 w-full h-[56px] z-50 border-hairline-b transition-cubic flex items-center justify-between px-margin-desktop">
      {/* Left: Wordmark + Network Badge */}
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-cubic cursor-pointer active:opacity-70">
          hub
        </span>
        <span className="font-headline-md text-headline-md font-bold tracking-tighter text-primary font-headline-lg-mobile">
          WALROS EXPLORER
        </span>
        <div className="hidden md:flex items-center ml-lg gap-sm px-sm py-1 bg-surface-container rounded-full border-hairline transition-cubic">
          <div className="w-2 h-2 rounded-full bg-green-500 indicator-pulse" />
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-label-md">
            Sui Testnet — Connected
          </span>
        </div>
      </div>

      {/* Center: Metrics */}
      <div className="hidden md:flex items-center gap-gutter font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-label-md">
        <div className="flex items-center gap-xs">
          <span>Active Topics:</span>
          <span className="font-label-md text-primary">12</span>
        </div>
        <div className="flex items-center gap-xs">
          <span>Total Blobs:</span>
          <span className="font-label-md text-primary">156</span>
        </div>
      </div>

      {/* Right: Settings Icon */}
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-on-surface-variant hover:text-secondary transition-cubic cursor-pointer active:opacity-70">
          settings
        </span>
      </div>
    </header>
  );
}
