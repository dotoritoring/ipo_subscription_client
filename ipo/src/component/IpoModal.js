"use client";

import { useState } from "react";
import { subscriptionApi } from "../../api/subscription";
import { useUserStore } from "@/store/userStore";

export default function IpoModal({ ipo, onClose, setIpos }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setUser } = useUserStore();

  const amount = ipo.price * quantity;
  const remainingPercent = (ipo.remainingQuantity / ipo.totalQuantity) * 100;

  const handleQuantityChange = (e) => {
    const value = Number(e.target.value);

    if (value < 1) {
      // 최소 수량
      setQuantity(1);
      return;
    }

    if (value > ipo.remainingQuantity) {
      // 최대 수량
      setQuantity(ipo.remainingQuantity);
      return;
    }

    setQuantity(value);
  };

  const handleSubscribe = async () => {
    const confirmed = window.confirm("청약을 신청하시겠습니까?");
    if (!confirmed) return;

    try {
      setLoading(true);
      setError(null);

      // 임시 사용자
      const userId = "1";

      const result = await subscriptionApi.subscriptionIpo(
        userId,
        ipo.id,
        quantity,
      );

      // 목록의 공모주 데이터 업데이트
      setIpos((prevIpos) =>
        prevIpos.map((item) => (item.id === result.ipo.id ? result.ipo : item)),
      );

      setUser(result.user);

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
            <span className="status status-open">청약 가능</span>
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
          <div className="subscription-form">
            <label htmlFor="quantity">청약 수량</label>
            <input
              id="quantity"
              type="number"
              min="1"
              max={ipo.remainingQuantity}
              value={quantity}
              onChange={handleQuantityChange}
            />
            <div className="amount">
              <span>청약 금액</span>
              <strong>{amount.toLocaleString()}원</strong>
            </div>
          </div>
          {error && <p className="error-message">{error}</p>}

          <button
            className="subscribe-button"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? "청약 신청 중" : "청약 신청"}
          </button>
        </div>
      </div>
    </div>
  );
}
