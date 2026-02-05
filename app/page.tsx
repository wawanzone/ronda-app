import { getDashboardData } from "@/lib/googleSheets";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const revalidate = 60; // Revalidate every 60 seconds

export default async function Home() {
  const data = await getDashboardData();

  return <DashboardClient data={data} />;
}
