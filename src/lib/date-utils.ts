/**
 * Formats a date string or Date object to 'dd/mm/yyyy' or 'dd/mm/yyyy hh:mm:ss'.
 * This function avoids timezone conversion by strictly parsing standard ISO or space-separated date strings (YYYY-MM-DD...)
 * and rearranging the parts.
 * 
 * @param dateInput - The date string or Date object.
 * @returns Formatted string 'dd/mm/yyyy [hh:mm:ss]' or '-' if invalid.
 */
export function formatDate(dateInput: string | Date | undefined | null): string {
    if (!dateInput || dateInput === '-') return '-';

    try {
        let dateStr = '';

        if (dateInput instanceof Date) {
            dateStr = dateInput.toISOString();
        } else {
            dateStr = String(dateInput).trim();
        }

        if (!dateStr || dateStr === '-') return '-';

        // Try to match YYYY-MM-DD HH:MM:SS (with space or T separating date and time)
        const matchWithTime = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
        if (matchWithTime) {
            const [_, year, month, day, hours, minutes, seconds] = matchWithTime;
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }

        // Try to match YYYY-MM-DD (date only)
        const matchDateOnly = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (matchDateOnly) {
            const [_, year, month, day] = matchDateOnly;
            return `${day}/${month}/${year}`;
        }

        // Fallback: If it's not standard YYYY-MM-DD, try to parse
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr; // Return original if parsing fails

        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        // Check if there is time information in the original string
        if (dateStr.includes(':') || dateInput instanceof Date) {
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
        }
        return `${day}/${month}/${year}`;

    } catch (e) {
        console.error("Date format error", e);
        return String(dateInput);
    }
}
