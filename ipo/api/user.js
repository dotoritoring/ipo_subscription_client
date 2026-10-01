const BASE_URL = "http://localhost:4000/users";

export const userApi = {
  getUser: async (userId) => {
    const user = await fetch(`${BASE_URL}/${userId}`);

    if (!user.ok) {
      throw new Error("사용자 정보를 불러올 수 없습니다.");
    }
    return user.json();
  },

  toggleFavoriteIpo: async (userId, ipoId) => {
    const response = await fetch(`${BASE_URL}/${userId}`);

    if (!response.ok) {
      throw new Error("사용자 정보를 불러올 수 없습니다.");
    }

    const user = await response.json();

    const favoriteIpos = user.favoriteIpos ?? [];

    const newFavoriteIpos = favoriteIpos.includes(ipoId) ? favoriteIpos.filter((id) => id !== ipoId) : [...favoriteIpos, ipoId];

    const updatedUser = await fetch(`${BASE_URL}/${userId}`, {
      method: "PATCH",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({favoriteIpos: newFavoriteIpos})
    })

    if(!updatedUser.ok){
      throw new Error("찜 변경에 실패했습니다.");
    }

    return updatedUser.json();

  }
};
