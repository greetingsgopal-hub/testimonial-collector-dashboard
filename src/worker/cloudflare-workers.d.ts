declare module 'cloudflare:workers' {
  interface ContainerTcpPort {
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
  }

  interface ContainerRuntime {
    readonly running: boolean;
    start(): void;
    getTcpPort(port: number): ContainerTcpPort;
  }

  interface VideoRendererDurableObjectState {
    container?: ContainerRuntime;
  }

  export class DurableObject<Env = unknown> {
    protected ctx: VideoRendererDurableObjectState;
    protected env: Env;
    constructor(ctx: VideoRendererDurableObjectState, env: Env);
  }
}
