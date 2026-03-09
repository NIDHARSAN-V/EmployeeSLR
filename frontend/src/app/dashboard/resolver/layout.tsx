

export const DashBoardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <div>
                Header
            </div>

            <div>
                Sidebar
            </div>

            <main>{children}</main>
        </div>
    );
}
export default DashBoardLayout;
