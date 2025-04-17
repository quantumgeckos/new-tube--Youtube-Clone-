import React from "react";

interface LayoutProps {
    children: React.ReactNode;
}

const Layout = ({children}: LayoutProps) => {
    return (
        <div>~
            <div className="p-4 bg-rose-400 w-full">
                Iam a navbar
            </div>
            {children}
        </div>
    )
}

export default Layout;