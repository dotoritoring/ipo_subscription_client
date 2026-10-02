import {IPO_STATUS_TEXT } from "@/utils/ipo";

export default function IpoCard({ ipo, status, onClick, isFavorite, onFavoriteClick }) {
  const remainingPercent = (ipo.remainingQuantity / ipo.totalQuantity) * 100;

  return (
    <article className="ipo-card">
      <div className="ipo-card-header">
        <div className="ipo-title">
          <h3>{ipo.name}</h3>

          {onFavoriteClick && (
            <button
              type="button"
              className={`favorite-button ${isFavorite ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                onFavoriteClick();
              }}
              aria-label={isFavorite ? "관심 해제" : "관심 등록"}
            >
              {isFavorite ? "★" : "☆"}
            </button>
          )}
        </div>
        <span className={`status status-${status.toLowerCase()}`}>
          {IPO_STATUS_TEXT[status]}
        </span>
      </div>
      <div className="ipo-price">
        <span>공모가</span>
        <strong>{ipo.price.toLocaleString()}원</strong>
      </div>
      <div className="ipo-info">
        <div>
          <span>청약 기간</span>
          <p>
            {ipo.startDate} ~ {ipo.endDate}
          </p>
        </div>
        <div>
          <span>남은 수량</span>
          <p>{ipo.remainingQuantity.toLocaleString()}주</p>
        </div>
      </div>

      <div className="quantity-progress">
        <div className="quantity-bar">
          <div
            className="quantity-bar-fill"
            style={{ width: `${remainingPercent}%` }}
          />
        </div>

        <span>{remainingPercent.toFixed(1)}% 남음</span>
      </div>

      <button className="detail-button" onClick={onClick}>
        상세 보기
      </button>
    </article>
  );
}
