import EpisodeCreator from '@/components/EpisodeCreator';
import EpisodeList from '@/components/EpisodeList';

export default function DashboardPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 slide-in">
            <h1 className="text-5xl font-bold gradient-text mb-4">
              Drama Studio
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Create cinematic drama series with AI-powered storytelling, 
              stunning visuals, and professional voice narration
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">AI Powered</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Freepik Integration</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-full">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Cinematic Quality</span>
              </div>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid gap-8">
            <div className="fade-in">
              <EpisodeCreator />
            </div>
            <div className="fade-in">
              <EpisodeList />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}



