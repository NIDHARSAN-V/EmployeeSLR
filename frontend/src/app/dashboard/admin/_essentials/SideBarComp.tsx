import Link from "next/link"
import React from "react"

export const SideBarComp = ( {title, children, location}: {title:string, location:string, children: React.ReactNode}) =>{
    return (
            <Link href={location}>
            <button className="hover:text-white hover:bg-slate-900 cursor-pointer w-50 h-10 rounded-xl">
                <span className="text-sm hover:translate-x-4 flex items-center font-mono gap-7 w-50 h-10 hover:text-lg">
                    {children}
                    <h6>{title}</h6>
                </span>
            </button>
            </Link>
    );
}
export default SideBarComp;