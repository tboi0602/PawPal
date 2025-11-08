/**
 * @param {Date | string} dateInput 
 * @param {string} format 
 * @returns {string} 
 */
export const formatDate = (dateInput, format = 'dd/mm/yyyy') => {
    let date;
    if (dateInput instanceof Date) {
        date = dateInput;
    } else if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        date = new Date(dateInput);
    } else {
        return 'Invalid Date'; 
    }

    if (isNaN(date.getTime())) {
        return 'Invalid Date';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    let formattedDate = format
        .replace('dd', day)
        .replace('mm', month)
        .replace('yyyy', year)
        .replace('HH', hours)
        .replace('MM', minutes)
        .replace('ss', seconds);

    return formattedDate;
};
