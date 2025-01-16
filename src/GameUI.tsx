<div className="w-full md:w-1/2 lg:w-2/5 flex flex-col p-2 md:border-r border-[#33ff33]/20 relative">
        {/* Mission Banner */}
        {characterInfo?.mission && (
          <div className="absolute top-0 left-0 right-0 bg-white/5 text-white p-2 text-center text-sm border-b border-white/10 font-mono">
            Mission: {characterInfo.mission}
          </div>
        )}
        <div 
          className="h-[calc(100vh-12rem)] mt-10 overflow-y-auto space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#33ff33]/20 hover:scrollbar-thumb-[#33ff33]/40"
          onScroll={onScroll}
        >