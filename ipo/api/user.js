const BASE_URL = "http://localhost:4000/users";

export const userApi = {
  getUser: async (userId) => {
    const response = await fetch(`${BASE_URL}/${userId}`);

    if (!response.ok) {
      throw new Error("사용자 정보를 불러올 수 없습니다.");
    }
    return response.json();
  },
};
