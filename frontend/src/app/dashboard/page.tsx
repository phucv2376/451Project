"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = ()=>{
    useEffect(() => {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) router.push("/login");
    }, []);
    
    const router = useRouter();

    return(
        <h1>HLP MEEE</h1>
    )
}

export default Dashboard;