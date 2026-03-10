import NavBar from "./_essentials/NavBar";
import SideBar from "./_essentials/SideBar";

export const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid h-screen grid-rows-[64px_1fr] grid-cols-[240px_1fr]">
      
      <div className="col-span-2">
        <NavBar />
      </div>

      <div className="row-start-2">
        <SideBar />
      </div>

      <main className="row-start-2 col-start-2 overflow-y-auto p-6 bg-background">
        {children}
      </main>
      
    </div>
  );
};

export default DashBoardLayout;