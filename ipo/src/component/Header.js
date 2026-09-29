import Link from "next/link";

export default function Header({user}){
    
    return(
        <header className="header">
            <div className="header-inner">
                <Link href="/" className="logo">IPO</Link>

                <div className="header-right">
                    {user && (
                        <>
                            <Link
                                href={`/subscriptions/${user.id}`}
                                className="subscription-link"
                            >
                                내 청약 내역
                            </Link>

                            <div className="balance">
                                <span>보유 금액</span>
                                <strong>
                                    {user.balance.toLocaleString()}원
                                </strong>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}