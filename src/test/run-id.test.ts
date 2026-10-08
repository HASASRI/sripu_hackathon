import { afterEach, describe, expect, it, vi } from "vitest";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "../lib/ai/run-id";

const H = "X-Lovable-AIG-Run-ID";

afterEach(() => vi.unstubAllGlobals());

describe("AI request run id", () => {
  it("sends an initial run id on requests", async () => {
    const mock = vi.fn(async () => new Response("ok"));
    vi.stubGlobal("fetch", mock);
    const r = createLovableAiGatewayRunIdFetch("run-1");
    await r.fetch("https://x.test");
    const headers = (mock.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Headers;
    expect(headers.get(H)).toBe("run-1");
    expect(await r.waitForRunId()).toBe("run-1");
  });

  it("learns the run id from the first response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("ok", { headers: { [H]: "run-2" } })));
    const r = createLovableAiGatewayRunIdFetch();
    expect(r.getRunId()).toBeUndefined();
    await r.fetch("https://x.test");
    expect(r.getRunId()).toBe("run-2");
  });

  it("re-throws network errors and resolves with no run id", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    const r = createLovableAiGatewayRunIdFetch();
    await expect(r.fetch("https://x.test")).rejects.toThrow("offline");
    expect(await r.waitForRunId()).toBeUndefined();
  });

  it("reads a run id from an incoming request", () => {
    expect(getLovableAiGatewayRunId(new Request("https://x.test", { headers: { [H]: " abc " } }))).toBe("abc");
    expect(getLovableAiGatewayRunId(new Request("https://x.test"))).toBeUndefined();
  });
});
