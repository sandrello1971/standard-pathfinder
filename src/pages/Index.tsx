import Hero from "@/components/Hero";
import StatsOverview from "@/components/StatsOverview";
import DocumentCategories from "@/components/DocumentCategories";
import RecentDocuments from "@/components/RecentDocuments";
import AIAssistant from "@/components/AIAssistant";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <StatsOverview />
      <AIAssistant />
      <DocumentCategories />
      <RecentDocuments />
    </div>
  );
};

export default Index;
