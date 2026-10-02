export function getSubscriptionStats(subscriptions){
    // 자산 통계
    const totalQuantity = subscriptions.reduce((acc, subscription)=> acc + Number(subscription.quantity) , 0)
    const totalAmount = subscriptions.reduce((acc, subscription) => acc + Number(subscription.amount), 0)
    // 청약한 공모주 종류 수
    const subscribedIpoCount = new Set(subscriptions.map(subscription => subscription.ipoId)).size;

    return {
        totalQuantity,
        totalAmount,
        subscribedIpoCount
    };
}