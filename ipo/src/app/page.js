"use client";

import Header from "@/component/Header";
import IpoList from "@/component/IpoList";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user";
import { useEffect } from "react";

export default function Home() {
  const { setUser } = useUserStore();
  const userId = "1";

  const {
    data: user,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId),
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  //   if (isLoading) {
  //   return <div className="empty">사용자 정보를 불러오는 중입니다.</div>;
  // }

  if (isError) {
    return <div className="empty">{error.message}</div>;
  }

  return (
    <>
      <Header />
      <main>
        <h1>공모주 청약</h1>
        <IpoList></IpoList>
      </main>
    </>
  );
}
