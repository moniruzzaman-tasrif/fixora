import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Booking, Payment, Service } from "../src/models/index.js";
import adminRoutes from "../src/routes/admin.js";
import serviceRoutes from "../src/routes/services.js";

const secret = "fixora-admin-route-tests";
const originalSecret = process.env.JWT_SECRET;
const originalDatabase = mongoose.connection.db;
const originalBookingFind = Booking.find;
const originalPaymentFind = Payment.find;
const originalServiceFind = Service.find;
const originalFindByIdAndUpdate = Service.findByIdAndUpdate;
const adminId = new mongoose.Types.ObjectId();
const customerId = new mongoose.Types.ObjectId();
const technicianId = new mongoose.Types.ObjectId();
let users = [];
let server;
let baseUrl;
let serviceUpdate;

function sortedRows(rows) {
  return {
    sort() {
      return Promise.resolve(rows);
    },
  };
}

const userCollection = {
  find() {
    return {
      sort() {
        return this;
      },
      async toArray() {
        return users;
      },
    };
  },
  async findOne(filter) {
    return users.find((user) =>
      (!filter._id || user._id.toString() === filter._id.toString()) &&
      (!filter.email || user.email === filter.email)
    ) ?? null;
  },
  async updateOne(filter, update) {
    const user = await this.findOne(filter);
    if (!user) return { matchedCount: 0, modifiedCount: 0 };
    Object.assign(user, update.$set);
    return { matchedCount: 1, modifiedCount: 1 };
  },
};

function resetUsers() {
  users = [
    {
      _id: adminId,
      name: "Test Admin",
      email: "admin@example.test",
      role: "admin",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      password: "must-not-be-returned",
      sessionToken: "must-not-be-returned",
    },
    {
      _id: customerId,
      name: "Test Customer",
      email: "customer@example.test",
      role: "customer",
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
      password: "must-not-be-returned",
    },
    {
      _id: technicianId,
      name: "Test Technician",
      email: "technician@example.test",
      role: "technician",
      createdAt: new Date("2026-01-03T00:00:00.000Z"),
    },
  ];
  serviceUpdate = undefined;
}

function tokenFor(user, role = user.role) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, role },
    secret,
    { expiresIn: "5m" }
  );
}

async function request(path, { method = "GET", token, body } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";
  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

before(async () => {
  process.env.JWT_SECRET = secret;
  mongoose.connection.db = {
    collection(name) {
      assert.equal(name, "user");
      return userCollection;
    },
  };
  resetUsers();

  const app = express();
  app.use(express.json());
  app.use("/admin", adminRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/services", serviceRoutes);
  server = app.listen(0, "127.0.0.1");
  await new Promise((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  mongoose.connection.db = originalDatabase;
  Booking.find = originalBookingFind;
  Payment.find = originalPaymentFind;
  Service.find = originalServiceFind;
  Service.findByIdAndUpdate = originalFindByIdAndUpdate;
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

test("admin user listing reads BetterAuth users without exposing credentials", async () => {
  resetUsers();
  const response = await request("/admin/users", {
    token: tokenFor(users[0]),
  });
  const rows = await response.json();

  assert.equal(response.status, 200);
  assert.equal(rows.length, 3);
  assert.equal(rows[0]._id, adminId.toString());
  assert.equal("password" in rows[0], false);
  assert.equal("sessionToken" in rows[0], false);
});

test("admin APIs reject unauthenticated and non-admin callers", async () => {
  resetUsers();
  const nonAdminTokens = [tokenFor(users[1]), tokenFor(users[2])];
  for (const path of [
    "/admin/users",
    "/admin/services",
    "/admin/bookings",
    "/admin/payments",
  ]) {
    const unauthenticated = await request(path);
    assert.equal(unauthenticated.status, 401, path);
    for (const token of nonAdminTokens) {
      const forbidden = await request(path, { token });
      assert.equal(forbidden.status, 403, path);
    }
  }
});

test("an admin JWT is rejected after the BetterAuth user is demoted", async () => {
  resetUsers();
  const adminToken = tokenFor(users[0]);
  users[0].role = "customer";

  const response = await request("/admin/users", { token: adminToken });

  assert.equal(response.status, 403);
});

test("role changes validate roles and reject self-edits", async () => {
  resetUsers();
  const adminToken = tokenFor(users[0]);
  const invalidRole = await request(`/admin/users/${customerId}/role`, {
    method: "PATCH",
    token: adminToken,
    body: { role: "owner" },
  });
  const selfEdit = await request(`/admin/users/${adminId}/role`, {
    method: "PATCH",
    token: adminToken,
    body: { role: "customer" },
  });
  const customerEdit = await request(`/admin/users/${adminId}/role`, {
    method: "PATCH",
    token: tokenFor(users[1]),
    body: { role: "admin" },
  });

  assert.equal(invalidRole.status, 400);
  assert.equal(selfEdit.status, 403);
  assert.equal(customerEdit.status, 403);
  assert.equal(users[0].role, "admin");
});

test("role changes persist only to the selected BetterAuth user", async () => {
  resetUsers();
  const response = await request(`/admin/users/${customerId}/role`, {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { role: "technician" },
  });
  const result = await response.json();

  assert.equal(response.status, 200);
  assert.equal(result.user.role, "technician");
  assert.equal(users[1].role, "technician");
  assert.equal(users[1].email, "customer@example.test");
  assert.equal(users[0].role, "admin");
});

test("service approval validates status and preserves availability", async () => {
  resetUsers();
  const serviceId = new mongoose.Types.ObjectId();
  const existingService = {
    _id: serviceId,
    approvalStatus: "approved",
    isAvailable: false,
  };
  Service.findByIdAndUpdate = async (id, update) => {
    serviceUpdate = { id, update };
    return { ...existingService, approvalStatus: update.$set.approvalStatus };
  };

  const invalid = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { approvalStatus: "published" },
  });
  const unauthorized = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[1]),
    body: { approvalStatus: "approved" },
  });
  const approved = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { approvalStatus: "approved" },
  });
  const result = await approved.json();

  assert.equal(invalid.status, 400);
  assert.equal(unauthorized.status, 403);
  assert.equal(approved.status, 200);
  assert.equal(result.service.approvalStatus, "approved");
  assert.equal(result.service.isAvailable, false);
  assert.deepEqual(serviceUpdate.update, { $set: { approvalStatus: "approved" } });
});

test("admin list endpoints return all records from their collections", async () => {
  resetUsers();
  const serviceRows = [{ _id: "service-1" }, { _id: "service-2" }];
  const bookingRows = [{ _id: "booking-1" }, { _id: "booking-2" }];
  const paymentRows = [{ _id: "payment-1" }, { _id: "payment-2" }];
  Service.find = () => sortedRows(serviceRows);
  Booking.find = () => sortedRows(bookingRows);
  Payment.find = () => sortedRows(paymentRows);
  const adminToken = tokenFor(users[0]);

  const [servicesResponse, bookingsResponse, paymentsResponse] =
    await Promise.all([
      request("/admin/services", { token: adminToken }),
      request("/admin/bookings", { token: adminToken }),
      request("/admin/payments", { token: adminToken }),
    ]);

  assert.deepEqual(await servicesResponse.json(), serviceRows);
  assert.deepEqual(await bookingsResponse.json(), bookingRows);
  assert.deepEqual(await paymentsResponse.json(), paymentRows);
});

test("public service listings require approved and available services", async () => {
  let filter;
  Service.find = (query) => {
    filter = query;
    return sortedRows([]);
  };

  const response = await request("/services");

  assert.equal(response.status, 200);
  assert.deepEqual(filter, {
    approvalStatus: "approved",
    isAvailable: true,
  });
});
