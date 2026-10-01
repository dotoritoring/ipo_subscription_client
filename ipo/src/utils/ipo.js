export const getIpoStatus = (ipo) => {
  const now = new Date();
  const startDate = new Date(`${ipo.startDate}T00:00:00`);
  const endDate = new Date(`${ipo.endDate}T23:59:59`);

  if (now < startDate) return "WAITING";
  if (now > endDate) return "CLOSED";
  if (ipo.remainingQuantity <= 0) return "SOLD_OUT";

  return "OPEN";
};

export const IPO_STATUS_TEXT = {
  OPEN: "청약 가능",
  WAITING: "청약 예정",
  CLOSED: "청약 종료",
  SOLD_OUT: "청약 마감",
};
