declare type Sources = {
    shaders?: {
        [name: string]: string;
    };
    images?: {
        [name: string]: string;
    };
};
declare type Requests = {
    shaders: {
        [name: string]: Promise<string>;
    };
    images: {
        [name: string]: Promise<HTMLImageElement>;
    };
};
declare type Response = {
    shaders: {
        [name: string]: string;
    };
    images: {
        [name: string]: HTMLImageElement;
    };
};
export default class {
    requests: Requests;
    constructor(sources: Sources);
    addShader(name: string, src: string): void;
    addImage(name: string, src: string): void;
    get response(): Promise<Response>;
}
export {};
