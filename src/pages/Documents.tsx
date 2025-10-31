import DocumentCategories from "@/components/DocumentCategories";
import RecentDocuments from "@/components/RecentDocuments";

const Documents = () => {
  return (
    <div className="min-h-screen">
      <DocumentCategories />
      <RecentDocuments />
    </div>
  );
};

export default Documents;
