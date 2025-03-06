"use client";

import NavBar from "../components/NavBar";
import { useRouter } from "next/navigation";

const TransactionPage = () => {
  const router = useRouter();

  return (
    <div className="flex bg-[#F1F5F9] min-h-screen w-full">
      <NavBar/>

      {/*Main Page*/}
      <div className="ml-[20%] mr-5 mt-5 w-3/4 h-full">
      
      </div>
    </div>
  );
};

export default TransactionPage;