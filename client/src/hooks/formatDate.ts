export function formatDate(date: string | number, type: "long" | "short" | "numeric" = "long", includeHours = false) {
    // console.log(date, new Date(date))
    if (type === "numeric") return new Date(date).toLocaleDateString('en-US');
    let formatted = new Date(date).toLocaleDateString("es-HN", {
        weekday: type,
        year: "numeric",
        month: type,
        day: "numeric",
        ...(includeHours ? {
            hour: "numeric",
            minute: "numeric",
        } : {})
    });
    return formatted[0].toUpperCase() + formatted.slice(1);
}
