"use client";
import { useQueryClient } from "@tanstack/react-query";
import { userApi } from "../../api/user";

export function useFavoriteIpo(){
    const queryClient = useQueryClient();

    const userId = "1";

    const toggleFavorite = async(ipoId)=>{
        try{
            const updatedUser = await userApi.toggleFavoriteIpo(userId, ipoId);

        // React Query의 user 캐시도 최신 정보로 변경
        queryClient.setQueryData(
            ["user", userId],
            updatedUser
        );
        }catch(error){
            alert(error.message);
        }
    }

    return {
    toggleFavorite,
     };
}