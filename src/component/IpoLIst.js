"use client";

import { useState } from "react";
import IpoCard from "./IpoCard";
import IpoModal from "./IpoModal";
import { ipoApi } from "../../api/ipo";
import { getIpoStatus } from "@/utils/ipo";
import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/user";
import { useFavoriteIpo } from "@/hooks/useFavoriteIpo";

export default function IpoList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedIpo, setSelectedIpo] = useState(null); // 상세 보기를 위해 선택된 ipo
  const {toggleFavorite} = useFavoriteIpo();

  const userId = "1";
  // useQuery: 컴포넌트가 렌더링되면서 데이터를 가져올 때 사용

  // 사용자 정보
  const {
    data: currentUser,
    isLoading:isUserLoading,
    isError:isUserError
  } = useQuery({
    queryKey:["user", userId],
    queryFn:()=>userApi.getUser(userId)
  })

  // 공모주 정보
  const {
    data: ipos = [],
    isLoading:isIpoLoading,
    isError: isIpoError,
  } = useQuery({
    queryKey: ["ipos"],
    queryFn: ipoApi.getIpos,
  });

  const filterIpos = ipos.filter((ipo) => {
    const status = getIpoStatus(ipo);

    const searchResult = ipo.name
      .toLowerCase()
      .includes(search.trim().toLowerCase()); // 포함 여부
    const statusReuslt = statusFilter === "ALL" || status === statusFilter; // 상태 필터가 ALL이거나 현재 선택한 필터와 같으면 true
    return searchResult && statusReuslt; // 둘 다 만족하는 ipo를 반환
  });

  if (isUserLoading) {
    return (
      <section className="ipo-section">
        <div className="empty">사용자 정보를 불러오는 중입니다.</div>
      </section>
    );
  }

  if (isUserError) {
    return (
      <section className="ipo-section">
        <div className="empty">
          사용자 정보를 불러오지 못했습니다.
        </div>
      </section>
    );
  }

  if (isIpoLoading) {
    return (
      <section className="ipo-section">
        <div className="empty">공모주 목록을 불러오는 중입니다.</div>
      </section>
    );
  }

  if (isIpoError) {
    return (
      <section className="ipo-section">
        <div className="empty">
          <p>공모주 목록을 불러오지 못했습니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="ipo-section">
      <div className="ipo-toolbar">
        <div>
          <h2>공모주</h2>
          <p>현재 진행 중인 공모주를 확인해보세요</p>
        </div>

        <div className="ipo-filter">
          <input
            type="text"
            placeholder="공모주 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">전체</option>
            <option value="OPEN">청약 가능</option>
            <option value="WAITING">청약 예정</option>
            <option value="CLOSED">청약 종료</option>
          </select>
        </div>
      </div>
      {filterIpos.length === 0 ? (
        <div className="empty">
          <p>조건에 맞는 공모주가 없습니다.</p>
        </div>
      ) : (
        <div className="ipo-grid">
          {filterIpos.map((ipo) => (
            <IpoCard
              key={ipo.id}
              ipo={ipo}
              status={getIpoStatus(ipo)}
              onClick={() => setSelectedIpo(ipo)}
              isFavorite={currentUser?.favoriteIpos?.includes(ipo.id) ?? false} // 찜을 했는지 안했는지 확인하여 UI 반영
              onFavoriteClick={()=> toggleFavorite(ipo.id)}
            />
          ))}
        </div>
      )}

      {selectedIpo && (
        <IpoModal
          ipo={selectedIpo}
          status={getIpoStatus(selectedIpo)}
          onClose={() => setSelectedIpo(null)}
        />
      )}
    </section>
  );
}
