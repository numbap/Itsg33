import { test } from "node:test";
import assert from "node:assert/strict";
import { CONTROL_MAP } from "../js/engine.js";
import { KINDS, PHASES, PHASE_MAP, PROCESS_MAP, PROCESS_NODES, PROCESS_START, nextIds } from "../js/data/process.js";

test("process: unique node IDs, known phases and kinds", () => {
  assert.equal(Object.keys(PROCESS_MAP).length, PROCESS_NODES.length, "duplicate node id");
  for (const n of PROCESS_NODES) {
    assert.ok(PHASE_MAP[n.phase], `${n.id} unknown phase ${n.phase}`);
    assert.ok(KINDS[n.kind], `${n.id} unknown kind ${n.kind}`);
    assert.ok(n.title && n.summary, `${n.id} missing title or summary`);
  }
  for (const p of PHASES) assert.ok(PROCESS_NODES.some((n) => n.phase === p.id), `phase ${p.id} has no steps`);
});

test("process: every link resolves and only end points are terminal", () => {
  for (const n of PROCESS_NODES) {
    if (n.kind === "question") {
      assert.ok(n.options?.length >= 2, `${n.id} needs at least two options`);
      for (const o of n.options) assert.ok(o.label && o.help, `${n.id} option without label or help`);
      assert.equal(n.next, undefined, `${n.id}: questions branch through options, not next`);
    }
    if (n.kind === "step") assert.ok(n.next, `${n.id}: activities must continue somewhere`);
    if (n.kind === "outcome") assert.equal(nextIds(n).length, 0, `${n.id}: end points do not continue`);
    for (const id of nextIds(n)) assert.ok(PROCESS_MAP[id], `${n.id} links to unknown ${id}`);
  }
});

test("process: every node is reachable from the start and can reach an end point or a loop", () => {
  const seen = new Set();
  const queue = [PROCESS_START];
  while (queue.length) {
    const id = queue.shift();
    if (seen.has(id)) continue;
    seen.add(id);
    queue.push(...nextIds(PROCESS_MAP[id]));
  }
  const unreachable = PROCESS_NODES.filter((n) => !seen.has(n.id)).map((n) => n.id);
  assert.deepEqual(unreachable, [], "unreachable steps");
});

test("process: related controls exist in the catalogue", () => {
  for (const n of PROCESS_NODES) {
    for (const id of n.controls ?? []) assert.ok(CONTROL_MAP[id], `${n.id} references unknown control ${id}`);
  }
});

test("process: in-app links point at real routes", () => {
  for (const n of PROCESS_NODES) {
    if (n.app) assert.match(n.app.href, /^#\/(profile|review|assess|report|library)$/, `${n.id} app link ${n.app.href}`);
  }
});
