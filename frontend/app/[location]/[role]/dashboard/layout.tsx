import DashboardAuth from "@/app/components/dashboard/auth/dashboard-auth";
import Navbar from "@/app/components/dashboard/layout/navbar";
import Topbar from "@/app/components/dashboard/layout/top-bar";
interface DashboardPageProps {
  params: {
    location: string;
    role: string;
  };
}
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<DashboardPageProps["params"]>;
}) {
  const { location, role } = await params;

  return (
    <DashboardAuth>
      <div className="bg-white w-screen h-screen flex">
        <div className="h-screen w-[15%]" id="nav-bar">
          <Navbar location={location} role={role} />
        </div>
        <div className="min-h-screen w-[85%] flex flex-col">
          <div id="top-bar" className="w-full h-20">
            <Topbar />
          </div>
          <div id="main-space " className="w-full h-full">
            {children}
          </div>
        </div>
      </div>
    </DashboardAuth>
  );
}
