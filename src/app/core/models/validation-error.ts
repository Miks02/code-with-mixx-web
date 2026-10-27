export type ValidationError = {
    errors: Record<string, string[]>,
    status: number,
    title: string
}