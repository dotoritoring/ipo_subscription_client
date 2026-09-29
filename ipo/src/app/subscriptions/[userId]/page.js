"use client";

import { use, useEffect, useState } from "react";
import { subscriptionApi } from "../../../../api/subscription";
import Link from "next/link";

export default function SubscriptionPage({ params }) {
  const { userId } = use(params);

  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("현재 userId:", userId);

        const data = await subscriptionApi.getSubscriptions(userId);

        console.log("받아온 청약 내역:", data);

        setSubscriptions(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [userId]);

  return (
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

      {loading && <div className="empty">청약 내역을 불러오는 중입니다.</div>}

      {!loading && !error && subscriptions.length === 0 && (
        <div className="empty">
          <p>아직 신청한 청약이 없습니다.</p>

          <Link href="/" className="empty-link">
            공모주 청약하러 가기
          </Link>
        </div>
      )}

      {!loading && !error && subscriptions.length > 0 && (
        <div className="subscription-list">
          {subscriptions.map((subscription) => (
            <article className="subscription-card" key={subscription.id}>
              <div className="subscription-card-header">
                <div>
                  <h2>{subscription.ipoName}</h2>

                  <p>공모가 {subscription.ipoPrice.toLocaleString()}원</p>
                </div>

                <span className="subscription-status">청약 완료</span>
              </div>

              <div className="subscription-info">
                <div>
                  <span>1주당 금액 </span>
                  <strong>{subscription.ipoPrice.toLocaleString()}주</strong>
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
  );
}
