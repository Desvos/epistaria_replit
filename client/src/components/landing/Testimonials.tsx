import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah J.",
    role: "Marketing Professional",
    content: "NewsletterAI has completely transformed how I consume industry content. The AI summaries save me at least an hour every day!",
    image: "https://randomuser.me/api/portraits/women/32.jpg",
    initial: "SJ"
  },
  {
    name: "David T.",
    role: "Tech Entrepreneur",
    content: "Having all my newsletters in one place with powerful organization tools has dramatically improved my content consumption workflow.",
    image: "https://randomuser.me/api/portraits/men/45.jpg",
    initial: "DT"
  },
  {
    name: "Lisa R.",
    role: "Financial Analyst",
    content: "The action item summaries help me quickly identify important tasks from my financial newsletters. Worth every penny of the Pro subscription!",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    initial: "LR"
  }
];

export default function Testimonials() {
  return (
    <div className="py-12 bg-white dark:bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold">What Our Users Say</h2>
        </div>
        
        <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-light-bg dark:bg-dark-bg p-6 rounded-lg shadow">
              <div className="flex items-center mb-4">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarFallback>{testimonial.initial}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{testimonial.name}</h3>
                  <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-text-secondary-light dark:text-text-secondary-dark italic">"{testimonial.content}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
