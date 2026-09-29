'use client';

import Header from "@/component/Header";
import IpoList from "@/component/IpoLIst";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);
  const userId = "1";

  useEffect(()=>{
    const fetchUser = async() => {
      try{
        const response = await fetch( `http://localhost:4000/users/${userId}`);
        if(!response.ok){
          throw new Error("사용자 정보를 불러올 수 없습니다.");
        }

        const data = await response.json();
        setUser(data);
      }catch(error){
        console.error(error);
      }
    }
    fetchUser();
  }, [])

  return(
    <>
    <Header user={user}/>
    <main>
      <h1>공모주 청약</h1>
      <IpoList></IpoList>
    </main>
    </>
  )
}
