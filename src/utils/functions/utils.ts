
export const currencyFormatter = (amount) => {

  const formattedAmount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN'
  }).format(amount);

  return formattedAmount
};

export const dateFormatter = (datetime) => {

  let date = datetime.split('T')[0];
  const newDate = new Date(date);
  const formattedDate = newDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return formattedDate

}
