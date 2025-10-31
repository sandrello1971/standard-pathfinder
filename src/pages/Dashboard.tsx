import Hero from "@/components/Hero";
import StatsOverview from "@/components/StatsOverview";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <StatsOverview />
    </div>
  );
};

export default Dashboard;
