import assert from "node:assert/strict";
import test from "node:test";

async function render(headers = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html", ...headers },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the VizPort Studio product shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="ko">/i);
  assert.match(html, /<title>VizPort Studio/);
  assert.match(html, /데이터를 넣으면/);
  assert.match(html, /샘플로 30초 체험/);
  assert.match(html, /href="#recommendations"/);
  assert.match(html, /React 코드/);
  assert.doesNotMatch(html, /[A-Z]:[\\/]Users[\\/]/i);
  assert.doesNotMatch(html, /Your site is taking shape|react-loading-skeleton/);
});

test("ignores untrusted forwarded hosts in public metadata", async () => {
  const response = await render({
    host: "evil.example",
    "x-forwarded-host": "evil.example",
    "x-forwarded-proto": "https",
  });
  const html = await response.text();

  assert.doesNotMatch(html, /evil\.example/);
  assert.match(
    html,
    /https:\/\/vizport-studio\.okorion\.chatgpt\.site\/og\.png/,
  );
});
