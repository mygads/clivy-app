declare module 'request-ip' {
  interface Request {
    headers?: Record<string, string | string[] | undefined>;
    connection?: { remoteAddress?: string | null } | null;
    socket?: { remoteAddress?: string | null } | null;
    info?: { remoteAddress?: string | null } | null;
    requestContext?: { identity?: { sourceIp?: string | null } | null } | null;
  }

  export default function getClientIp(req: Request): string | null;
}
