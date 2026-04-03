export function buildQueryParams<T extends Record<string, any>>(params: T): string {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        // skip undefined / null
        if (value === undefined || value === null) return;

        // handle arrays → comma separated
        if (Array.isArray(value)) {
            if (value.length === 0) return;
            query.append(key, value.join(','));
            return;
        }

        // handle booleans, numbers, strings
        query.append(key, String(value));
    });

    return query.toString();
}