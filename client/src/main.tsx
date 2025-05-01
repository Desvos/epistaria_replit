import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add CSS variables for colors to match the design
document.documentElement.style.setProperty('--primary', '207 90% 54%');
document.documentElement.style.setProperty('--primary-foreground', '0 0% 100%');
document.documentElement.style.setProperty('--accent', '271 76% 53%');
document.documentElement.style.setProperty('--accent-foreground', '0 0% 100%');
document.documentElement.style.setProperty('--secondary', '123 73% 44%');
document.documentElement.style.setProperty('--secondary-foreground', '0 0% 100%');

createRoot(document.getElementById("root")!).render(<App />);
