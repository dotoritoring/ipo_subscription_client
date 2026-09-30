"use client";

import { use, useEffect, useState } from "react";
import { subscriptionApi } from "../../../../api/subscription";
import Link from "next/link";
import Header from "@/component/Header";
import { useUserStore } from "@/store/userStore";
import { useQuery } from "@tanstack/react-query";

export default function SubscriptionPage({ params }) {
  const { userId } = use(params);
  
  const {setUser} = useUserStore();
//   const [subscriptions, setSubscriptions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [search, setSearch] = useState("");

//   useEffect(() => {
//     const fetchSubscriptions = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         console.log("현재 userId:", userId);

//         const data = await subscriptionApi.getSubscriptions(userId);

//         setSubscriptions(data);
//       } catch (error) {
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubscriptions();
//   }, [userId]);

    // data를 subscriptions 이름으로 바꿔서 사용, 처음 렌더링될 때 API 응답이 오기 전까지는 data가 있을 수 없으므로 빈 배열로 초기화 필요
    const {data:subscriptions = [], isLoading, isError, error, refetch} = useQuery({
        queryKey: ["subscriptions", userId],
        queryFn: () => subscriptionApi.getSubscriptions(userId)
    });

  const searchSubscriptions = subscriptions.filter((subscription) => subscription.ipoName.toLowerCase().includes(search.trim().toLowerCase()))

  const handleCancel = async(subscriptionId) => {
    const confirmed = window.confirm("청약을 취소하시겠습니까?");

    if(!confirmed) return;

    try{
        setCancelLoading(subscriptionId);

        const updatedUser = await subscriptionApi.cancelSubscription(subscriptionId);
        setUser(updatedUser);

        subscriptions.filter((subscription) => subscription.id !== subscriptionId);
        await refetch();


    }catch(error){
    }finally{
        setCancelLoading(null);
    }
  }

  return (
    <>
    <Header/>
    <main>
      <div className="subscription-page-header">
        <div>
          <h1>내 청약 내역</h1>
          <p>내가 신청한 공모주 청약 내역을 확인할 수 있습니다.</p>
        </div>

        <Link href="/" className="back-button">
          공모주 목록
        </Link>
      </div>

      <div className="subscription-filter">
  <input
    type="text"
    placeholder="공모주 검색"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>


      {isLoading && <div className="empty">청약 내역을 불러오는 중입니다.</div>}
      {isError && <div className="empty">{error.message}</div>}

      {!isLoading && !isError && subscriptions.length === 0 && (
        <div className="empty">
          <p>아직 신청한 청약이 없습니다.</p>

          <Link href="/" className="empty-link">
            공모주 청약하러 가기
          </Link>
        </div>
      )}

      {!isLoading && !error && searchSubscriptions.length === 0 ? (
        <div className="empty">
            <p>조건에 맞는 신청이 없습니다.</p>
        </div>
      ) : (
        <div className="subscription-list">
          {searchSubscriptions.map((subscription) => (
            <article className="subscription-card" key={subscription.id}>
              <div className="subscription-card-header">
                <div>
                  <h2>{subscription.ipoName}</h2>

                  <p>공모가 {subscription.ipoPrice.toLocaleString()}원</p>
                </div>

                <div className="subscription-card-actions">
                    <span className="subscription-status">청약 완료</span>

                <button className="cancel-button" onClick={()=> handleCancel(subscription.id)} disabled={cancelLoading===subscription.id}>
                    {cancelLoading===subscription.id ? "취소 중": "청약 취소"}
                </button>

                </div>
              </div>

              <div className="subscription-info">
                <div>
                  <span>1주당 금액 </span>
                  <strong>{subscription.ipoPrice.toLocaleString()}원</strong>
                </div>
                <div>
                  <span>청약 수량</span>
                  <strong>{subscription.quantity.toLocaleString()}주</strong>
                </div>

                <div>
                  <span>총 청약 금액</span>
                  <strong>{subscription.amount.toLocaleString()}원</strong>
                </div>

                <div>
                  <span>청약 신청일</span>
                  <strong>
                    {new Date(subscription.createdAt).toLocaleDateString(
                      "ko-KR",
                    )}
                  </strong>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
    </>
  );
}