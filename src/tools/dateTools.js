export default class dateTools {
    // TODO: Rename to dateUtils & rename directory
    static getInclusiveDaysBetweenDates(startDate, endDate) {
        const diffInMs = new Date(endDate) - new Date(startDate);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24) + 1; // Include end day
        return diffInDays;
    }

    static getTimeForTimestamp(value, seperator) {
        return value.split(seperator)[1];
    }

    static createHourLableFromNumber(hour) {
        if (hour < 10) {
            return `0${hour}:00:00`;
        } else {
            return `${hour}:00:00`;
        }
    }

    static createLableFromDateAndHour(date, hour) {
        return `${date} ${this.createHourLableFromNumber(hour)}`;
    }
}