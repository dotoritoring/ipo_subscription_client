"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { userApi } from "../../api/user";

export default function Header() {
  const userId = "1";

  const {
    data: currentUser,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId),
  });

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="logo">
          IPO
        </Link>

        <div className="header-right">
          <Link href="/" className="subscription-link">
            공모주 목록
          </Link>
          {currentUser && (<>
          <Link href="/my" className="subscription-link">
            내 자산
          </Link>

            <Link
              href={`/subscriptions/${currentUser.id}`}
              className="subscription-link"
            >
              내 청약 내역
            </Link>
            </>
          )}

          <div className="balance">
            <span>보유 금액</span>

            <strong>
              {isLoading
                ? "불러오는 중..."
                : isError
                  ? "-"
                  : `${currentUser.balance.toLocaleString()}원`}
            </strong>
          </div>
        </div>
      </div>
    </header>
  );
}
