"use client";

import { useState } from "react";
import { subscriptionApi } from "../../api/subscription";
import { IPO_STATUS_TEXT } from "@/utils/ipo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user";

export default function IpoModal({ ipo, status, onClose }) {
  const [quantity, setQuantity] = useState(ipo.remainingQuantity === 0 ? 0 : 1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const userId = "1";
  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError: isUserError
  } = useQuery({
    queryKey:["user", userId],
    queryFn: ()=>userApi.getUser(userId)
  })

  const isAvailable = status === "OPEN" && ipo.remainingQuantity > 0;

  const amount = ipo.price * quantity;
  const checkBalance = currentUser && amount > currentUser.balance;
  const remainingPercent = (ipo.remainingQuantity / ipo.totalQuantity) * 100;

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    if(value === ""){
      setQuantity(0);
      return;
    }

    const number = Number(value);

    if (!Number.isInteger(number)|| number < 0) {
      setQuantity(0);
      return;
    }

    if (value > ipo.remainingQuantity) {
      // 최대 수량
      setQuantity(ipo.remainingQuantity);
      return;
    }

    setQuantity(number);
  };

  const handleSubscribe = async () => {
    const confirmed = window.confirm(
      `${quantity.toLocaleString()}주를 청약하시겠습니까?`,
    );
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      const result = await subscriptionApi.subscriptionIpo(
        userId,
        ipo.id,
        quantity,
      );

      // React Query의 캐시가 기존 데이터가 아닌 새로운 데이터로 업데이트 해주기 위함
      // MyPage의 자산 통계 갱신
      await queryClient.invalidateQueries({
        queryKey:["subscriptions", userId]
      })

      // 사용자 정보 갱신
      await queryClient.invalidateQueries({
        queryKey: ["user", userId],
      });

      // 공모주 남은 수량 갱신
      await queryClient.invalidateQueries({
        queryKey: ["ipos"],
      });

      alert("청약 신청이 완료되었습니다.");
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ipo-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{ipo.name}</h2>
            <span className={`status status-${status.toLowerCase()}`}>{IPO_STATUS_TEXT[status]}</span>
          </div>
          <button className="modal-close" onClick={onClose}>
            X
          </button>
        </div>
        <div className="modal-content">
          <div className="modal-info">
            <div>
              <span>공모가</span>
              <strong>{ipo.price.toLocaleString()}원</strong>
            </div>
            <div>
              <span>청약 기간</span>
              <strong>
                {ipo.startDate} ~ {ipo.endDate}
              </strong>
            </div>
          </div>
          <div className="quantity-section">
            <div className="quantity-title">
              <span>남은 청약 수량</span>
              <strong>{ipo.remainingQuantity.toLocaleString()}주</strong>
            </div>
            <div className="quantity-bar">
              <div
                className="quantity-bar-fill"
                style={{ width: `${remainingPercent}%` }}
              ></div>
            </div>

            <p>
              전체 {ipo.totalQuantity.toLocaleString()}주 중{" "}
              {remainingPercent.toFixed(1)}% 남음
            </p>
          </div>
          {isAvailable ? (
            <div className="subscription-form">
              <label htmlFor="quantity">청약 수량</label>
              <input
                id="quantity"
                type="number"
                min={ipo.remainingQuantity === 0 ? 0 : 1}
                max={ipo.remainingQuantity}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={loading}
              />
              <div className="amount">
                <span>청약 금액</span>
                <strong>{amount.toLocaleString()}원</strong>
              </div>
              <div className="balance-info">
                <span>보유 금액</span>
                <strong> {currentUser.balance.toLocaleString() ?? 0}원</strong>
              </div>
              {checkBalance && (
                <p className="error-message">
                  보유 금액이 부족합니다.
                  <br />
                  청약 가능 금액: {currentUser.balance.toLocaleString()}원
                </p>
              )}
            </div>
          ) : (
            <div className="empty">
              {status === "WAITING" && "아직 청약 기간이 시작되지 않았습니다."}
              {status === "CLOSED" && "청약 기간이 종료되었습니다."}
              {status === "OPEN" &&
                ipo.remainingQuantity === 0 &&
                "청약 수량이 모두 소진되었습니다."}
            </div>
          )}
          {error && <p className="error-message">{error}</p>}

          <button
            className="subscribe-button"
            onClick={handleSubscribe}
            disabled={loading || !isAvailable || quantity <= 0 || checkBalance}
          >
            {loading ? "청약 신청 중" : "청약 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}
