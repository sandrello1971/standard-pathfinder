import Hero from "@/components/Hero";
import StatsOverview from "@/components/StatsOverview";
import DocumentCategories from "@/components/DocumentCategories";
import RecentDocuments from "@/components/RecentDocuments";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <StatsOverview />
      <DocumentCategories />
      <RecentDocuments />
    </div>
  );
};

export default Index;
