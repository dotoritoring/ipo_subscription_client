const BASE_URL = "http://localhost:4000";

const getToday = () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const date = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${date}`;
};

export const ipoApi = {
  // 공모주 목록 조회
  getIpos: async () => {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("공모주 목록을 불러오지 못했습니다.");
    }

    return await response.json();
  },

  // 공모주 상세 조회
  getIpo: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error("공모주 정보를 불러오지 못했습니다.");
    }

    return await response.json();
  },

  // 청약 완료시, 남은 청약 수량 수정
  updateRemainingQuantity: async (id, quantity) => {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error("공모주 정보를 불러오지 못했습니다.");
    }

    const ipo = await response.json(); // 업데이트 대상인 공모주 데이터

    // 청약일 확인
    const today = getToday();

    if (today < ipo.startDate) {
      throw new Error("청약 기간이 시작되지 않았습니다.");
    }

    if (today > ipo.endDate) {
      throw new Error("청약 기간이 종료된 공모주입니다.");
    }

    // 공모주 상태 확인
    if (ipo.status !== "OPEN") {
      throw new Error("현재 청약할 수 없는 공모주입니다.");
    }

    // 청약 가능 수량 확인
    if (quantity > ipo.remainingQuantity) {
      throw new Error("청약 가능 수량을 초과했습니다.");
    }

    const newRemainingQuantity = ipo.remainingQuantity - quantity;

    const updateResponse = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remainingQuantity: newRemainingQuantity }),
    });

    if (!updateResponse.ok) {
      throw new Error("청약 수량 변경에 실패했습니다.");
    }

    return await updateResponse.json();
  },

  // 복구

  // 청약 취소 -> 기간 확인
};
