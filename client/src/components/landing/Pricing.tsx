import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function Pricing() {
  const [, navigate] = useLocation();

  const plans = [
    {
      name: "Free",
      description: "Get started with the basics",
      price: 0,
      features: [
        { text: "Up to 5 newsletters", available: true },
        { text: "5 AI summaries/month", available: true },
        { text: "Basic organization tools", available: true },
        { text: "Custom summaries", available: false },
      ],
      popular: false,
      buttonText: "Sign Up Free",
    },
    {
      name: "Pro",
      description: "Perfect for newsletter enthusiasts",
      price: 9,
      features: [
        { text: "Unlimited newsletters", available: true },
        { text: "50 AI summaries/month", available: true },
        { text: "Advanced organization", available: true },
        { text: "Basic custom summaries", available: true },
      ],
      popular: true,
      buttonText: "Get Started",
    },
    {
      name: "Business",
      description: "For power users and teams",
      price: 19,
      features: [
        { text: "Unlimited everything", available: true },
        { text: "Unlimited AI summaries", available: true },
        { text: "Team collaboration", available: true },
        { text: "Advanced custom summaries", available: true },
      ],
      popular: false,
      buttonText: "Start Trial",
    },
  ];

  return (
    <div id="pricing" className="py-12 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-2xl mx-auto">
            Choose the plan that works best for you
          </p>
        </div>

        <div className="mt-12 grid gap-8 grid-cols-1 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white dark:bg-dark-card rounded-lg shadow-md overflow-hidden ${
                plan.popular ? "transform scale-105 border-2 border-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white py-2 px-6 text-center">
                  <span className="text-sm font-medium">MOST POPULAR</span>
                </div>
              )}
              <div className="p-6">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
                  {plan.description}
                </p>
                <p className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-text-secondary-light dark:text-text-secondary-dark">
                    /month
                  </span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex">
                      {feature.available ? (
                        <Check className="text-secondary mt-1 mr-2 h-5 w-5" />
                      ) : (
                        <X className="text-text-secondary-light dark:text-text-secondary-dark mt-1 mr-2 h-5 w-5" />
                      )}
                      <span
                        className={
                          feature.available
                            ? ""
                            : "text-text-secondary-light dark:text-text-secondary-dark"
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-6 py-4 bg-light-bg dark:bg-dark-bg">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  {plan.buttonText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
