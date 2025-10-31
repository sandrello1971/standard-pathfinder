import StatsOverview from "@/components/StatsOverview";
import RecentDocuments from "@/components/RecentDocuments";

const Dashboard = () => {
  return (
    <div className="min-h-screen">
      <StatsOverview />
      <RecentDocuments />
    </div>
  );
};

export default Dashboard;
