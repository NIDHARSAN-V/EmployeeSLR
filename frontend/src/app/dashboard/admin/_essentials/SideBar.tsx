import { SideBarComp } from "./SideBarComp";

export const SideBar = () => {
  return (
    <div className="sideBar">
      <SideBarComp title="Dashboard" location="/dashboard/admin">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 3h6v7.5h-6V3zM14.25 3h6v4.5h-6V3zM14.25 12.75h6V21h-6v-8.25zM3.75 14.25h6V21h-6v-6.75z"
          />
        </svg>
      </SideBarComp>

      <SideBarComp
        title="Tickets Management"
        location="/dashboard/admin/tickets"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5v3a2.25 2.25 0 010 4.5v3H3.75v-3a2.25 2.25 0 010-4.5v-3z"
          />
        </svg>
      </SideBarComp>

      <SideBarComp title="Assets Management" location="/dashboard/admin/assets">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6M8.25 6h7.5m-10.5 3.75h13.5v9.75H5.25V9.75z"
          />
        </svg>
      </SideBarComp>

      <SideBarComp title="Users" location="/dashboard/admin/users">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0H4.5z"
          />
        </svg>
      </SideBarComp>

      <SideBarComp title="SLA-Tracking" location="/dashboard/admin/slatracking">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 21V9m5.25 12V3m5.25 18v-6m5.25 6V6"
          />
        </svg>
      </SideBarComp>
    </div>
  );
};

export default SideBar;
