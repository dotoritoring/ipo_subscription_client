"use client";

import { useEffect, useState } from "react";
import IpoCard from "./IpoCard";
import IpoModal from "./IpoModal";
import { ipoApi } from "../../api/ipo";

export default function IpoList(){
    const [ipos, setIpos] = useState([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedIpo, setSelectedIpo] = useState(null); // 상세 보기를 위해 선택된 ipo

    useEffect(()=>{
        const fetchIpos = async() => {
            try{
                const data = await ipoApi.getIpos();
                setIpos(data);
            }catch(error){
                throw new Error(error);
            }
        }
        fetchIpos();
    }, []);

    const filterIpos = ipos.filter((ipo) =>{
        const searchResult = ipo.name.toLowerCase().includes(search.toLowerCase()); // 포함 여부
        const statusReuslt = statusFilter==="ALL" || ipo.status === statusFilter; // 상태 필터가 ALL이거나 현재 선택한 필터와 같으면 true
        return searchResult&&statusReuslt; // 둘 다 만족하는 ipo를 반환
    });

    return(
        <section className="ipo-section">
            <div className="ipo-toolbar">
                <div>
                    <h2>공모주</h2>
                    <p>현재 진행 중인 공모주를 확인해보세요</p>
                </div>
            

            <div className="ipo-filter">
                <input type="text" placeholder="공모주 검색" value={search} onChange={(e)=> setSearch(e.target.value)}/>
                <select value={statusFilter} onChange={(e)=> setStatusFilter(e.target.value)}>
                    <option value="ALL">전체</option>
                    <option value="OPEN">청약 가능</option>
                    <option value="WAITING">청약 예정</option>
                    <option value="CLOSED">청약 종료</option>
                </select>
            </div>
            </div>
            {filterIpos.length===0 ? (
                <div className="empty">
                    <p>조건에 맞는 공모주가 없습니다.</p>
            </div>
        ) : (
            <div className="ipo-grid">
                {filterIpos.map((ipo)=> (
                    <IpoCard key = {ipo.id} ipo={ipo} onClick={()=> setSelectedIpo(ipo)}/>
                ))}
            </div>
        )}

        {selectedIpo && (
            <IpoModal ipo={selectedIpo} onClose={()=> setSelectedIpo(null)} setIpos={setIpos}/>
        )}

        </section>
    )
}