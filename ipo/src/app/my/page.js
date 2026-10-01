"use client";

import { useQuery } from "@tanstack/react-query";
import { userApi } from "../../../api/user";
import { subscriptionApi } from "../../../api/subscription";
import { ipoApi } from "../../../api/ipo";
import { getIpoStatus } from "@/utils/ipo";
import Link from "next/link";
import { useState } from "react";
import { useFavoriteIpo } from "@/hooks/useFavoriteIpo";
import IpoCard from "@/component/IpoCard";
import IpoModal from "@/component/IpoModal";

export default function MyPage(){
     const [selectedIpo, setSelectedIpo] = useState(null);
     const {toggleFavorite} = useFavoriteIpo();

    const userId = "1"; 

    const {
        data: currentUser,
        isLoading:isUserLoading,
        isError:isUserError,
    } = useQuery({
        queryKey:["user",userId],
        queryFn: () => userApi.getUser(userId)
    });

    const {
        data: subscriptions = [],
        isLoading: isSubscriptionsLoading,
        isError: isSubscriptionsError
    } = useQuery({
        queryKey:["subscriptions", userId],
        queryFn: ()=> subscriptionApi.getSubscriptions(userId)
    });

    const {
        data:ipos = [],
        isLoading: isIpoLoading,
        isError: isIpoError
    } = useQuery({
        queryKey:["ipos"],
        queryFn: ipoApi.getIpos
    })

    if(isUserLoading || isSubscriptionsLoading || isIpoLoading){
        return <div className="empty">내 자산 정보를 불러오는 중입니다.</div>;
    }

    if(isUserError || isSubscriptionsError || isIpoError){
        return <div className="empty">정보를 불러오지 못했습니다.</div>;
    }

    // 자산 통계
    const totalQuantity = subscriptions.reduce((acc, subscription)=> acc + Number(subscription.quantity) , 0)
    const totalAmount = subscriptions.reduce((acc, subscription) => acc + Number(subscription.amount), 0)
    // 청약한 공모주 종류 수
    const subscribedIpoCount = new Set(subscriptions.map(subscription => subscription.ipoId)).size;

    // 관심 공모주
    const favoriteIpos = ipos.filter((ipo)=>currentUser?.favoriteIpos?.includes(ipo.id))

    const handleIpoClick = (ipo) => {setSelectedIpo(ipo);};
    const handleCloseModal = () => {setSelectedIpo(null);};

    return (
    <main>
      <div className="my-page-header">
        <div>
          <h1>내 자산</h1>
          <p>나의 공모주 투자 현황을 확인해보세요.</p>
        </div>
      </div>

      {/* 자산 요약 */}
      <section className="asset-section">
        <div className="asset-balance">
          <span>보유 금액</span>
          <strong>
            {currentUser.balance.toLocaleString()}원
          </strong>
        </div>

        <div className="asset-summary">
          <div>
            <span>총 청약 수량</span>
            <strong>
              {totalQuantity.toLocaleString()}주
            </strong>
          </div>

          <div>
            <span>총 청약 금액</span>
            <strong>
              {totalAmount.toLocaleString()}원
            </strong>
          </div>

          <div>
            <span>청약 공모주</span>
            <strong>{subscribedIpoCount}개</strong>
          </div>
        </div>
      </section>

      <section className="favorite-section">
        <div className="favorite-section-header">
          <div>
            <h2>관심 공모주</h2>
            <p>관심 등록한 공모주를 확인해보세요.</p>
          </div>

          <span>{favoriteIpos.length}개</span>
        </div>

        {favoriteIpos.length === 0 ? (
          <div className="empty favorite-empty">
            관심 등록한 공모주가 없습니다.
          </div>
        ) : (
          <div className="ipo-grid">
            {favoriteIpos.map((ipo) => {
              const status = getIpoStatus(ipo);

              return (
                <IpoCard
                  key={ipo.id}
                  ipo={ipo}
                  status={status}
                  isFavorite={true}
                  onFavoriteClick={() => {toggleFavorite(ipo.id)}}

                  onClick={() => handleIpoClick(ipo)}
                />
              );
            })}
          </div>
        )}
      </section>
      {selectedIpo && (
        <IpoModal
          ipo={selectedIpo}
          status={getIpoStatus(selectedIpo)}
          onClose={handleCloseModal}
        />
      )}
    </main>
  );
}