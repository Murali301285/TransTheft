
/**
 * Formats a date string or Date object to 'dd/mm/yyyy'.
 * This function avoids timezone conversion by strictly parsing standard ISO date strings (YYYY-MM-DD...)
 * and rearranging the parts.
 * 
 * @param dateInput - The date string (ISO) or Date object.
 * @returns Formatted string 'dd/mm/yyyy' or '-' if invalid.
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
    if (!dateInput) return '-';

    try {
        let dateStr = '';

        if (dateInput instanceof Date) {
            // For Date objects, we have to trust the local instance methods
            // But if the user strictly said "no timezone conversion", they likely deal with strings from API.
            // Converting Date to ISO string to treat it uniformly.
            dateStr = dateInput.toISOString();
        } else {
            dateStr = dateInput;
        }

        // Handle ISO-like strings: YYYY-MM-DD...
        // This regex looks for the pattern at the start of the string
        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (match) {
            const [_, year, month, day] = match;
            return `${day}/${month}/${year}`;
        }

        // Fallback: If it's not a standard ISO string, try to parse it (though this might do TZ conversion)
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return String(dateInput); // Return original if parsing fails

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();

        return `${day}/${month}/${year}`;

    } catch (e) {
        console.error("Date format error", e);
        return String(dateInput);
    }
}
