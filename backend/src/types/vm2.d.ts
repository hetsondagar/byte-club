declare module 'vm2' {
  export class VM {
    constructor(options?: {
      timeout?: number;
      sandbox?: any;
    });
    
    run(code: string): any;
  }
}
