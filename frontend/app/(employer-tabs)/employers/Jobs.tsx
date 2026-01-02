import jsonData from "@/data/jobs.json";
import EmployerJobsHeader from "@/components/employer/EmployerJobsHeader";
import EmployerJobsList from "@/components/employer/EmployerJobsList";
import EmployerJobFilters from "@/components/employer/EmployerJobFilters";
import { JobsData } from "@/types/job.types";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

interface Category {
  id: string;
  name: string;
}

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
  const jobs = data.jobs;

  // Compute unique categories dynamically from jobs data
  const uniqueCategories = [...new Set(jobs.map((job) => job.category))].sort();
  const categories: Category[] = [
    { id: "all", name: "All Categories" },
    ...uniqueCategories.map((cat) => ({
      id: cat,
      name: categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
    })),
  ];

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <EmployerJobsHeader />
      <EmployerJobFilters
        
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onSearchChange={setSearchQuery}
        searchQuery={searchQuery}
        categories={categories}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />
      <EmployerJobsList
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        statusFilter={selectedStatus}
      />
    </SafeAreaView>
  );
}
