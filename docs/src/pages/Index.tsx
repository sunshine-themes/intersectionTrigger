import { useState, useCallback, useEffect } from "react";
import Navbar from "@/components/Navbar";
import DocsSidebar from "@/components/DocsSidebar";
import DocContent from "@/components/DocContent";
import { docSections } from "@/data/docSections";

const Index = () => {
  const [activeSection, setActiveSection] = useState("introduction");

  const handleNavigate = useCallback((id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );

    docSections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onNavigate={handleNavigate} />
      <div className="flex">
        <DocsSidebar activeSection={activeSection} onNavigate={handleNavigate} />
        <DocContent sections={docSections} />
      </div>
    </div>
  );
};

export default Index;
