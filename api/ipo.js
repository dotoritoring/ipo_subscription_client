const BASE_URL = "http://localhost:4000/ipos";


export const ipoApi = {
  // 공모주 목록 조회
  getIpos: async () => {
    const response = await fetch(BASE_URL);

    if (!response.ok) {
      throw new Error("공모주 목록을 불러오지 못했습니다.");
    }

    return response.json();
  },

  // 공모주 상세 조회
  getIpo: async (id) => {
    const response = await fetch(`${BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error("공모주 정보를 불러오지 못했습니다.");
    }

    return response.json();
  },

};
