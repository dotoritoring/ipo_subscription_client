export const getIpoStatus = (ipo) => {
    const now = new Date();
    const startDate = new Date(ipo.startDate);
    const endDate = new Date(ipo.endDate);

    if(now < startDate) return "WAITING";
    if(now > endDate) return "CLOSED";
    if(ipo.remainingQuantity <= 0) return "SOLD_OUT";

    return "OPEN";
}