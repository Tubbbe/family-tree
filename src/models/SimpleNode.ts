export interface SimpleNode {
    id: string;
    type: string;
    data: { label: string };
    position: { x: number, y: number };
}