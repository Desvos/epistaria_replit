import { 
  Underline, 
  Brain, 
  Inbox, 
  Moon, 
  Smartphone, 
  CreditCard 
} from "lucide-react";

const features = [
  {
    icon: <Underline className="h-6 w-6" />,
    title: "Dedicated Email Address",
    description: "Get a unique Zoho Mail alias for all your newsletter subscriptions, keeping your main inbox clean."
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "AI Summaries",
    description: "Get instant AI-generated summaries of long newsletters in various formats: bullet points, executive summary, and more."
  },
  {
    icon: <Inbox className="h-6 w-6" />,
    title: "Gmail-Style Interface",
    description: "Familiar, intuitive interface for managing your newsletters with folders, tags, and search."
  },
  {
    icon: <Moon className="h-6 w-6" />,
    title: "Dark Mode",
    description: "Easy on the eyes with full dark mode support for comfortable reading in any lighting condition."
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Responsive Design",
    description: "Perfect experience on any device - desktop, tablet, or mobile phone."
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Flexible Subscriptions",
    description: "Choose the plan that works for you with simple, transparent pricing and easy upgrades."
  }
];

export default function Features() {
  return (
    <div className="py-12 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Powerful Features for Newsletter Lovers</h2>
          <p className="mt-4 text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
            Everything you need to take control of your newsletter subscriptions
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="bg-white dark:bg-dark-card rounded-lg shadow-md p-6">
              <div className="text-accent mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
