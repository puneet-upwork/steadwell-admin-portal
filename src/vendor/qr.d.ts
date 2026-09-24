export type ErrorCorrection = "low" | "medium" | "quartile" | "high";
export type QrOpts = { ecc?: ErrorCorrection; border?: number; scale?: number; optimize?: boolean };
export declare function encodeQR(text: string, output: "svg", opts?: QrOpts): string;
export declare function encodeQR(text: string, output: "raw" | "ascii" | "term" | "gif", opts?: QrOpts): unknown;
export default encodeQR;
