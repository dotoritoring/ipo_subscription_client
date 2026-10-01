const BASE_URL = "http://localhost:4000/subscriptions";
const IPO_BASE_URL = "http://localhost:4000/ipos";
const USER_BASE_URL = "http://localhost:4000/users";

// 날짜 형식
const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

export const subscriptionApi = {
  // 청약 내역 조회
  getSubscriptions: async (userId) => {
    const response = await fetch(`${BASE_URL}?userId=${userId}`);

    if (!response.ok) {
      throw new Error("청약 내역을 불러오지 못했습니다.");
    }

    const subscriptions = await response.json();

    // 공모주 목록
    const ipoResponse = await fetch(IPO_BASE_URL);

    if (!ipoResponse.ok) {
      throw new Error("공모주 목록을 불러오지 못했습니다.");
    }

    const ipos = await ipoResponse.json();

    // 청약 내역과 공모주 정보 연결
    return [...subscriptions] // .sort()는 원본 배열을 바꾸는 함수이고, subscriptions이 state로 관리되고 있으므로 직접 변경을 피하기 위해 복사해서 사용
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((subscription) => {
        const ipo = ipos.find((ipo) => ipo.id === subscription.ipoId);

        return {
          ...subscription,
          ipoName: ipo?.name ?? "알 수 없는 공모주",
          ipoPrice: ipo?.price ?? 0,
        };
      });
  },

  // 청약 신청
  subscriptionIpo: async (userId, ipoId, quantity) => {
    let ipoUpdated = false;

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error("청약 수량은 1주 이상의 정수여야 합니다.");
  }

    const userResponse = await fetch(`${USER_BASE_URL}/${userId}`);
    if (!userResponse.ok) {
      throw new Error("사용자 정보를 불러오지 못했습니다.");
    }

    const user = await userResponse.json();

    const response = await fetch(`${IPO_BASE_URL}/${ipoId}`);

    if (!response.ok) {
      throw new Error("공모주 정보를 불러오지 못했습니다.");
    }

    const ipo = await response.json(); // 업데이트 대상인 공모주 데이터

    // 청약 금액 계산 및 잔액 검증
    const amount = ipo.price * quantity;

    if (user.balance < amount) {
      throw new Error("보유 금액이 부족합니다.");
    }

    // 청약일 확인
    const today = getToday();

    if (today < ipo.startDate) {
      throw new Error("청약 기간이 시작되지 않았습니다.");
    }

    if (today > ipo.endDate) {
      throw new Error("청약 기간이 종료된 공모주입니다.");
    }

    // 청약 가능 수량 확인
    if (quantity > ipo.remainingQuantity) {
      throw new Error(`청약 가능 수량을 초과했습니다. 현재 최대 ${ipo.remainingQuantity.toLocaleString()}주까지 청약할 수 있습니다.`);
    }

    // 청약 내역 생성
    const subscriptionResponse = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        ipoId,
        quantity,
        amount,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!subscriptionResponse.ok) {
      throw new Error("청약 내역을 생성하지 못했습니다.");
    }

    const subscription = await subscriptionResponse.json();

    const newRemainingQuantity = ipo.remainingQuantity - quantity;
    const newBalance = user.balance - amount;

    try {
      const updateResponse = await fetch(`${IPO_BASE_URL}/${ipoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remainingQuantity: newRemainingQuantity }),
      });

      if (!updateResponse.ok) {
        throw new Error("청약 수량 변경에 실패했습니다.");
      }

      ipoUpdated = true;

      const updatedUser = await fetch(`${USER_BASE_URL}/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: newBalance }),
      });

      if (!updatedUser.ok) {
        throw new Error("잔액 변경에 실패했습니다.");
      }

      const ipoResponse = await updateResponse.json();
      const userResponse = await updatedUser.json();

      return { ipo: ipoResponse, user: userResponse };
    } catch (error) {
      // 수량 변경 실패시 앞에서 만든 청약 내역 삭제
      await fetch(`${BASE_URL}/${subscription.id}`, {
        method: "DELETE",
      });

      // 공모주 수량 변경까지 진행되었지만, 사용자 잔액 변경에 실패했을 때
      if (ipoUpdated) {
        await fetch(`${IPO_BASE_URL}/${ipoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ remainingQuantity: ipo.remainingQuantity }),
        });
      }

      throw error;
    }
  },

  // 청약 취소
  cancelSubscription: async (subscriptionId) => {
    // 취소할 청약 내역 조회
    const response = await fetch(`${BASE_URL}/${subscriptionId}`);

    if (!response.ok) {
      throw new Error("청약 내역을 찾을 수 없습니다.");
    }

    const subscription = await response.json();

    // 사용자 정보 조회
    const userResponse = await fetch(`${USER_BASE_URL}/${subscription.userId}`);
    if (!userResponse.ok) {
      throw new Error("사용자 정보를 불러오지 못했습니다.");
    }

    const user = await userResponse.json();

    // 해당 공모주 조회
    const ipoResponse = await fetch(`${IPO_BASE_URL}/${subscription.ipoId}`);

    if (!ipoResponse.ok) {
      throw new Error("공모주 정보를 불러오지 못했습니다.");
    }

    const ipo = await ipoResponse.json();

    // 청약 기간 확인
    const today = getToday();

    if (today < ipo.startDate) {
      throw new Error("청약 기간이 시작되지 않았습니다.");
    }

    if (today > ipo.endDate) {
      throw new Error("청약 기간이 종료되어 취소할 수 없습니다.");
    }

    // 취소된 수량만큼 공모주 수량 복구
    const newRemainingQuantity = ipo.remainingQuantity + subscription.quantity;

    const updateResponse = await fetch(
      `${IPO_BASE_URL}/${subscription.ipoId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remainingQuantity: newRemainingQuantity }),
      },
    );

    if (!updateResponse.ok) {
      throw new Error("공모주 수량 복구에 실패했습니다.");
    }

    // 취소하는 금액만큼 사용자 잔액 복구
    const newBalance = user.balance + subscription.amount;

    const updatedUser = await fetch(`${USER_BASE_URL}/${subscription.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ balance: newBalance }),
    });

    if (!updatedUser.ok) { 
      // 사용자 잔액 변경에 실패했으므로 위에서 변경한 공모주 수량을 원래대로 복구
      await fetch(`${IPO_BASE_URL}/${subscription.ipoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          remainingQuantity: ipo.remainingQuantity,
        }),
      });

      throw new Error("잔액 변경에 실패했습니다.");
    }

    const updatedUserData = await updatedUser.json();

    try {
      // 청약 내역 삭제
      const deleteResponse = await fetch(`${BASE_URL}/${subscriptionId}`, {
        method: "DELETE",
      });

      if (!deleteResponse.ok) {
        throw new Error("청약 내역 삭제에 실패했습니다.");
      }
    } catch (error) {
      // 청약 내역 삭제 실패시 복구했던 공모주 수량을 다시 원래대로 되돌리기
      await fetch(`${IPO_BASE_URL}/${subscription.ipoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remainingQuantity: ipo.remainingQuantity }),
      });

      // 청약 내역 삭제 실패시 사용자 잔액을 다시 원래대로 되돌리기
      await fetch(`${USER_BASE_URL}/${subscription.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ balance: user.balance }),
      });

      throw error;
    }

    return updatedUserData;
  },
};
