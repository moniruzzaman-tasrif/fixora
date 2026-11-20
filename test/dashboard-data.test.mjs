import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, parseApiList } from "../src/lib/api.ts";
import { getBookingStatusCounts } from "../src/lib/dashboard-metrics.ts";

test("dashboard lists preserve the exact records returned by the API", () => {
  const records = [{ id: "one" }, { id: "two" }, { id: "three" }];

  assert.deepEqual(parseApiList(records, "/services/mine"), records);
  assert.equal(parseApiList(records, "/services/mine").length, 3);
});

test("a real empty list remains empty", () => {
  assert.deepEqual(parseApiList([], "/booking/mine"), []);
});

test("a non-list success response becomes an API error instead of an empty state", () => {
  assert.throws(
    () => parseApiList({ data: [] }, "/admin/bookings"),
    (error) =>
      error instanceof ApiError &&
      error.status === 502 &&
      error.message.includes("/admin/bookings")
  );
});

test("booking status chart counts include every assigned status", () => {
  const counts = getBookingStatusCounts([
    { status: "requested" },
    { status: "accepted" },
    { status: "in-progress" },
    { status: "completed" },
    { status: "rejected" },
    { status: "cancelled" },
  ]);

  assert.deepEqual(counts, {
    requested: 1,
    accepted: 1,
    inProgress: 1,
    completed: 1,
    closed: 2,
  });
  assert.equal(
    Object.values(counts).reduce((total, count) => total + count, 0),
    6
  );
});
