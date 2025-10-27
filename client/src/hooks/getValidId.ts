export default function getValidId(id1: string | undefined, id2: number | undefined = 0): number | null {
    let id = parseInt(id1 || `${id2}`);
    return (isNaN(id) || id === 0) ? null : id;
}
