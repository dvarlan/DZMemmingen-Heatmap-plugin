export default class dateTools {

    static getInclusiveDaysBetweenDates(startDate, endDate) {
        const diffInMs = new Date(endDate) - new Date(startDate);
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24) + 1; // Include end day
        return diffInDays;
    }

    static getLabelForTimestamp(value) {
        return value.replaceAll("T", " ").replaceAll("-", ".");
    }
}