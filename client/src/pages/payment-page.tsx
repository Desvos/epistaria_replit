import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useStripe,
  useElements,
  Elements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Lock } from "lucide-react";

// Use VITE_STRIPE_PUBLIC_KEY or a fake key for development
const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_fake123456789abcdef';
const isFakeKey = stripeKey.includes('fake');

// Just a warning if using a fake key
if (isFakeKey) {
  console.log('Using fake Stripe key for development - payment UI will be displayed but not functional');
}

const stripePromise = loadStripe(stripeKey);

function CheckoutForm({ plan, amount }: { plan: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/app`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "You are now subscribed!",
      });
      navigate("/app");
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-light-bg dark:bg-dark-bg p-4 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">{plan} Plan</p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
              Monthly subscription
            </p>
          </div>
          <p className="font-semibold">${amount.toFixed(2)}/month</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : "Subscribe"}
      </Button>

      <div className="mt-6 text-center">
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex items-center justify-center">
          <Lock className="h-4 w-4 mr-2" />
          Secure payment processed with Stripe
        </p>
      </div>
    </form>
  );
}

export default function PaymentPage() {
  const [clientSecret, setClientSecret] = useState("");
  const [plan, setPlan] = useState("Pro");
  const [amount, setAmount] = useState(9);
  
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Create subscription when the page loads
    apiRequest("POST", "/api/get-or-create-subscription")
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
        setPlan(data.plan);
        setAmount(data.amount);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to set up payment. Please try again.",
          variant: "destructive",
        });
        console.error("Payment setup error:", error);
        navigate("/plan");
      });
  }, [toast, navigate]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
      <div className="max-w-md w-full mx-4">
        <Card className="shadow-md">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <CreditCard className="text-primary h-10 w-10 mx-auto mb-2" />
              <h2 className="text-2xl font-bold">Payment Details</h2>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                Enter your payment information to complete signup
              </p>
            </div>

            <Elements
              stripe={stripePromise}
              options={{ clientSecret, appearance: { theme: "stripe" } }}
            >
              <CheckoutForm plan={plan} amount={amount} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
