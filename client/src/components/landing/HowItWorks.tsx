export default function HowItWorks() {
  return (
    <div className="py-12 bg-white dark:bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">How It Works</h2>
          <p className="mt-4 text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
            Start organizing your newsletters in just a few simple steps
          </p>
        </div>

        <div className="mt-12 relative">
          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold">Sign Up</h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                Create your account and get a personal Zoho Mail alias for your newsletters.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold">Subscribe to Newsletters</h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                Use your new email address to subscribe to all your favorite newsletters.
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold">Manage & Summarize</h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                Access your newsletters in one place and use AI to generate quick summaries.
              </p>
            </div>
          </div>
          
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-20 left-1/6 w-2/3 border-t-2 border-dashed border-primary z-0"></div>
        </div>
      </div>
    </div>
  );
}
