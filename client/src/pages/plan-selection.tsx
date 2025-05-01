import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CheckCircle, ClipboardList } from "lucide-react";

type Plan = "free" | "pro" | "business";

export default function PlanSelection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const selectPlanMutation = useMutation({
    mutationFn: async (plan: Plan) => {
      const res = await apiRequest("POST", "/api/subscriptions/select-plan", { plan });
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Plan selected",
        description: data.message || "Your plan has been successfully selected.",
      });
      
      if (selectedPlan === "free") {
        navigate("/app");
      } else {
        navigate("/payment");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error selecting plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const handleContinue = () => {
    if (selectedPlan) {
      selectPlanMutation.mutate(selectedPlan);
    } else {
      toast({
        title: "No plan selected",
        description: "Please select a plan to continue.",
        variant: "destructive",
      });
    }
  };

  const handleSkip = () => {
    selectPlanMutation.mutate("free");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="max-w-4xl w-full mx-4">
        <Card className="shadow-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <ClipboardList className="text-primary text-3xl h-10 w-10 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Choose Your Plan</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Select the plan that works best for you
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Free Plan */}
              <div
                className={`border-2 ${
                  selectedPlan === "free"
                    ? "border-primary"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-lg p-6 hover:border-primary transition-colors cursor-pointer relative`}
                onClick={() => handleSelectPlan("free")}
              >
                {selectedPlan === "free" && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Free</h3>
                  <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                    Basic newsletter management
                  </p>
                  <p className="mt-4 mb-4">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                      /month
                    </span>
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Up to 5 newsletters</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>5 AI summaries/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Basic organization tools</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div
                className={`border-2 ${
                  selectedPlan === "pro"
                    ? "border-primary"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-lg p-6 hover:border-primary transition-colors cursor-pointer relative shadow-md`}
                onClick={() => handleSelectPlan("pro")}
              >
                {selectedPlan === "pro" && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
                <div className="absolute top-0 right-0 -mt-2 mr-4 bg-primary text-white text-xs font-bold py-1 px-2 rounded-full">
                  POPULAR
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Pro</h3>
                  <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                    Perfect for newsletter enthusiasts
                  </p>
                  <p className="mt-4 mb-4">
                    <span className="text-3xl font-bold">$9</span>
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                      /month
                    </span>
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Unlimited newsletters</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>50 AI summaries/month</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Advanced organization</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Basic custom summaries</span>
                  </li>
                </ul>
              </div>

              {/* Business Plan */}
              <div
                className={`border-2 ${
                  selectedPlan === "business"
                    ? "border-primary"
                    : "border-gray-200 dark:border-gray-700"
                } rounded-lg p-6 hover:border-primary transition-colors cursor-pointer relative`}
                onClick={() => handleSelectPlan("business")}
              >
                {selectedPlan === "business" && (
                  <div className="absolute top-2 right-2 text-primary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold">Business</h3>
                  <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
                    For power users and teams
                  </p>
                  <p className="mt-4 mb-4">
                    <span className="text-3xl font-bold">$19</span>
                    <span className="text-text-secondary-light dark:text-text-secondary-dark">
                      /month
                    </span>
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Unlimited everything</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Unlimited AI summaries</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Team collaboration</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-secondary mr-2 h-5 w-5" />
                    <span>Advanced custom summaries</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              <Button
                onClick={handleContinue}
                disabled={!selectedPlan || selectPlanMutation.isPending}
                className="w-full max-w-md"
              >
                {selectPlanMutation.isPending ? "Processing..." : "Continue"}
              </Button>
              <Button
                variant="link"
                onClick={handleSkip}
                disabled={selectPlanMutation.isPending}
              >
                Skip for now
              </Button>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mt-2">
                All plans include a 14-day free trial. No credit card required for free plan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
