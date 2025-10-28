export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 300,
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function (...args: Parameters<T>) {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
            // @ts-expect-error ignore-this-error
            func.apply(this, args);
        }, wait);
    };
}