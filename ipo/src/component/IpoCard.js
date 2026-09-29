export default function IpoCard({ipo, onClick}){
    const statusText = {
        OPEN: "청약 가능",
        WAITING: "청약 예정",
        CLOSED: "청약 종료"
    };

    const remainingPercent =
    (ipo.remainingQuantity / ipo.totalQuantity) * 100;

    return(
        <article className="ipo-card">
            <div className="ipo-card-header">
                <h3>{ipo.name}</h3>
                <span className={`status status-${ipo.status.toLowerCase()}`}>
                    {statusText[ipo.status]}
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
            <div className="quantity-bar-fill" style={{ width: `${remainingPercent}%` }}/></div>

            <span>{remainingPercent.toFixed(1)}% 남음</span>
            </div>

            <button className="detail=button" onClick={onClick}>상세 보기</button>
        </article>
    )
}