export interface hnItem{
    id: number;
    type: "job" | "story" | "comment" | "poll";
    by?: string;
    time: number;
    text?: string;
    dead?: boolean;
    parent?: number;
    //poll không rõ
    kids?: number[];
    url?: string;
    score?: number;
    title?: string;
    descendants?: number;
}