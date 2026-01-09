

export const getSecondsUntilEndOfDay = () => {
  const now = new Date();
  const endOfDay = new Date();

  endOfDay.setHours(23, 59, 59, 999); 

  return Math.ceil((endOfDay.getTime() - now.getTime()) / 1000);
};
