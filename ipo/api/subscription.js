const BASE_URL = "http://localhost:4000/subscription";

export const subscriptionApi = {
  // 청약 내역 조회
  getSubscription: async (userId) => {
    const response = await fetch(`${BASE_URL}?userId=${userId}`);

    if (!response.ok) {
      throw new Error("청약 내역을 불러오지 못했습니다.");
    }
    return await response.json();
  },

  // 청약 신청
  createSubscription: async (newSubscription) => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSubscription),
    });

    if (!response.ok) {
      throw new Error("청약 신청에 실패했습니다.");
    }

    return await response.json();
  },

  // 청약 취소
  // 청약 내역 삭제
};
