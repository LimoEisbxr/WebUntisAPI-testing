export async function formatUntisTime(value: string) {
    return value.slice(0, -2) + ":" + value.slice(-2);
}
