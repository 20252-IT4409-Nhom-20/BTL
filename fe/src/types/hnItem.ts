export interface hnItem {
    id: number;
    _id?: string;
    deleted?: boolean;
    type: 'job' | 'story' | 'comment' | 'poll' | 'pollopt';
    by?: string;
    time: number;
    text?: string;
    dead?: boolean;
    parent?: string | number;
    poll?: number;
    // API responses expand kids into nested item objects.
    // The database stores kids as numeric ids.
    kids?: hnItem[];
    url?: string;
    score?: number;
    title?: string;
    parts?: number[];
    descendants?: number;
}
