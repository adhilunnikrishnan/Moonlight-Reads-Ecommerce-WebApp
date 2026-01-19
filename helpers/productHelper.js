export const getStockStatus = (stock) => {
  const stockNum = parseInt(stock, 10); // ensure number

  if (stockNum > 20) {
    return `🟢 Available (${stockNum})`;
  } else if (stockNum > 0 && stockNum <= 20) {
    return `🟠 Hurry up! Only ${stockNum} left`;
  } else {
    return `🔴 Currently unavailable`;
  }
};
