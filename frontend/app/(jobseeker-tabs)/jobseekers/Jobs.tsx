// jobseekers/jobs.tsx (assuming path based on your router; adjust if needed)
import JobsHeader from "@/components/jobseeker/JobsHeader";
import JobsList from "@/components/jobseeker/JobsList";
import SearchAndSort from "@/components/jobseeker/SearchAndSort";
import jsonData from "@/data/jobs.json";
import { JobsData } from "@/types/job.types";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
interface Category {
  id: string;
  name: string;
}
// Mapping for pretty display names (add more as needed; fallback to capitalize if missing)
const categoryNames: { [key: string]: string } = {
  it: "IT & Software",
  design: "Design",
  business: "Business",
  construction: "Construction",
  finance: "Finance",
  healthcare: "Healthcare",
  education: "Education",
  sales: "Sales & Marketing",
  hospitality: "Hospitality",
  transport: "Transport",
  creative: "Creative",
  agriculture: "Agriculture",
  security: "Security & Law",
};
export default function Jobs() {
  const data = jsonData as JobsData;
  const jobs = data.jobs; // Extract jobs array
  // Compute unique categories dynamically from jobs data
  const uniqueCategories = [...new Set(jobs.map((job) => job.category))].sort();
  const categories: Category[] = [
    { id: "all", name: "All" },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      name: categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1), // Fallback to capitalized
    })),
  ];
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <SafeAreaView className="flex-1">
      <JobsHeader />
      <SearchAndSort
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories} // Pass dynamic categories
      />
      <JobsList selectedCategory={selectedCategory} searchQuery={searchQuery} />
    </SafeAreaView>
  );
}
