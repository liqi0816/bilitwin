export interface EBMLData {
    write(buf: Uint8Array, pos: number): number;
    countSize(): number;
}
export declare class Value implements EBMLData {
    private bytes;
    constructor(bytes: Uint8Array);
    write(buf: Uint8Array, pos: number): number;
    countSize(): number;
}
export declare class Element implements EBMLData {
    private id;
    private children;
    private readonly size;
    private readonly sizeMetaData;
    constructor(id: Uint8Array, children: EBMLData[], isSizeUnknown: boolean);
    write(buf: Uint8Array, pos: number): number;
    countSize(): number;
}
export declare const bytes: Function;
export declare const number: Function;
export declare const vintEncodedNumber: Function;
export declare const int16: Function;
export declare const float: Function;
export declare const string: Function;
export declare const element: (id: Uint8Array, child: EBMLData | EBMLData[]) => EBMLData;
export declare const unknownSizeElement: (id: Uint8Array, child: EBMLData | EBMLData[]) => EBMLData;
export declare const build: (v: EBMLData) => Uint8Array;
export declare const getEBMLByteLength: (num: number) => number;
export declare const UNKNOWN_SIZE: Uint8Array;
export declare const vintEncode: (byteArray: Uint8Array) => Uint8Array;
export declare const getSizeMask: (byteLength: number) => number;
