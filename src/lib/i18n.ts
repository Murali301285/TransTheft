import { useAppStore } from './store';
import uiData from '@/locales/ui.json';
import { Dictionary } from './types';

// Cast the JSON to the Dictionary type
const dictionary: Dictionary = uiData;

export function useText() {
    const language = useAppStore((state) => state.language);

    const t = (key: string): string => {
        if (!dictionary[key]) {
            console.warn(`Missing translation for key: ${key}`);
            return key;
        }
        return dictionary[key][language] || dictionary[key]['en'];
    };

    return { t, language };
}
