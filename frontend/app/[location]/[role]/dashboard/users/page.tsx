import UserTable from "@/app/components/dashboard/users/table";

interface DashboardPageProps {
  params: {
    location: string;
    role: string;
  };
}
export default async function Dashboard({
  params,
}: {
  params: Promise<DashboardPageProps["params"]>;
}): Promise<React.ReactElement> {
  const { location, role } = await params;
  console.log(location, role);

  return (
    <div className="bg-white text-black p-8">
      <UserTable />
    </div>
  );
}
