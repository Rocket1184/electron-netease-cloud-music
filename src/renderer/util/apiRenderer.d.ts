import * as ApiFunc from '../../main/api/index';

 // TypeScript is MAGIC!
type Promisfy<T> = T extends ((...args: any[]) => any)
    ? T extends ((...args: any[]) => Promise<any>)
    ? T
    : (...args: Parameters<T>) => Promise<ReturnType<T>>
    : T;

type AllPromisfy<T> = { [P in keyof T]: Promisfy<T[P]> }

declare var ApiRenderer: AllPromisfy<typeof ApiFunc>;

export default ApiRenderer;
