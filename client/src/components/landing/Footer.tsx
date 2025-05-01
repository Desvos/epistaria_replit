import { Underline } from "lucide-react";

export default function Footer() {
  const footerLinks = [
    {
      category: "Product",
      links: [
        { text: "Features", href: "#" },
        { text: "Pricing", href: "#pricing" },
        { text: "FAQ", href: "#" },
      ],
    },
    {
      category: "Company",
      links: [
        { text: "About", href: "#" },
        { text: "Blog", href: "#" },
        { text: "Careers", href: "#" },
      ],
    },
    {
      category: "Support",
      links: [
        { text: "Help Center", href: "#" },
        { text: "Contact Us", href: "#" },
        { text: "Status", href: "#" },
      ],
    },
    {
      category: "Legal",
      links: [
        { text: "Privacy", href: "#" },
        { text: "Terms", href: "#" },
        { text: "Cookie Policy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="bg-light-bg dark:bg-dark-bg py-12 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-sm font-semibold uppercase tracking-wider">
                {section.category}
              </h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Underline className="text-primary h-6 w-6 mr-2" />
            <span className="font-semibold text-lg">NewsletterAI</span>
          </div>
          <p className="mt-4 md:mt-0 text-text-secondary-light dark:text-text-secondary-dark">
            &copy; {new Date().getFullYear()} NewsletterAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
