export const getIpoStatus = (ipo) => {
  const now = new Date();
  const startDate = new Date(`${ipo.startDate}T00:00:00`);
  const endDate = new Date(`${ipo.endDate}T23:59:59`);

  if (now < startDate) return "WAITING";
  if (now > endDate) return "CLOSED";
  if (ipo.remainingQuantity <= 0) return "SOLD_OUT";

  return "OPEN";
};
