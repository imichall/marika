export const formatDateWithTime = (date: string, time: string | null): string => {
  const months = [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ];

  const dateObj = new Date(date);
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const formattedTime = time ? ` v ${time.substring(0, 5)}` : ' v 19:00';

  return `${day}. ${month} ${year}${formattedTime}`;
};