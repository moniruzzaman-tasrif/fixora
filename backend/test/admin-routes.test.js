import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Booking, Payment, Service } from "../src/models/index.js";
import adminRoutes from "../src/routes/admin.js";
import bookingRoutes from "../src/routes/bookings.js";
import serviceRoutes from "../src/routes/services.js";

const secret = "fixora-admin-route-tests";
const originalSecret = process.env.JWT_SECRET;
const originalDatabase = mongoose.connection.db;
const originalBookingFind = Booking.find;
const originalPaymentFind = Payment.find;
const originalServiceFind = Service.find;
const originalServiceFindById = Service.findById;
const originalServiceCreate = Service.create;
const originalBookingFindOne = Booking.findOne;
const originalBookingCreate = Booking.create;
const originalBookingFindById = Booking.findById;
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
      image: "https://i.ibb.co/technician.jpg",
      area: "Mirpur",
      bio: "Repairs phones and laptops.",
      createdAt: new Date("2026-01-03T00:00:00.000Z"),
    },
  ];
  serviceUpdate = undefined;
}

function tokenFor(user, role = user.role) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name, role },
    secret,
    { expiresIn: "5m" }
  );
}

function dhakaDateOffset(days) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type) => parts.find((item) => item.type === type)?.value;
  const date = new Date(
    `${part("year")}-${part("month")}-${part("day")}T00:00:00.000Z`
  );
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

test("booking model targets the existing singular booking collection", () => {
  assert.equal(Booking.collection.collectionName, "booking");
});

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
  app.use("/booking", bookingRoutes);
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
  Booking.findOne = originalBookingFindOne;
  Booking.create = originalBookingCreate;
  Booking.findById = originalBookingFindById;
  Payment.find = originalPaymentFind;
  Service.find = originalServiceFind;
  Service.findById = originalServiceFindById;
  Service.create = originalServiceCreate;
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

test("booking creation validates required fields and date before loading a service", async () => {
  resetUsers();
  let serviceLookups = 0;
  const originalFindById = Service.findById;
  Service.findById = async () => {
    serviceLookups += 1;
    return null;
  };
  const body = {
    serviceId: new mongoose.Types.ObjectId().toString(),
    customerPhone: "0000000000",
    address: "Test address",
    preferredDate: dhakaDateOffset(1),
    problemDescription: "The screen is damaged and needs repair.",
  };
  const invalidBodies = [
    { ...body, serviceId: "not-an-object-id" },
    { ...body, customerPhone: " " },
    { ...body, address: " " },
    { ...body, preferredDate: dhakaDateOffset(-1) },
    { ...body, preferredDate: "2026-02-31" },
    { ...body, problemDescription: "Too short" },
  ];

  try {
    for (const invalidBody of invalidBodies) {
      const response = await request("/booking", {
        method: "POST",
        token: tokenFor(users[1]),
        body: invalidBody,
      });
      assert.equal(response.status, 400);
    }
    assert.equal(serviceLookups, 0);
  } finally {
    Service.findById = originalFindById;
  }
});

test("duplicate active booking returns the requested error without creating a record", async () => {
  resetUsers();
  const serviceId = new mongoose.Types.ObjectId();
  const originalFindById = Service.findById;
  const originalFindOne = Booking.findOne;
  const originalCreate = Booking.create;
  let duplicateFilter;
  let createCalls = 0;
  Service.findById = async () => ({
    _id: serviceId,
    approvalStatus: "approved",
    isAvailable: true,
    technicianEmail: users[2].email,
  });
  Booking.findOne = async (filter) => {
    duplicateFilter = filter;
    return { _id: new mongoose.Types.ObjectId() };
  };
  Booking.create = async () => {
    createCalls += 1;
    throw new Error("Duplicate booking must not be created");
  };

  try {
    const response = await request("/booking", {
      method: "POST",
      token: tokenFor(users[1]),
      body: {
        serviceId: serviceId.toString(),
        customerPhone: "0000000000",
        address: "Test address",
        preferredDate: dhakaDateOffset(1),
        problemDescription: "The screen is damaged and needs repair.",
      },
    });

    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), {
      message: "You already have an active request for this service",
    });
    assert.deepEqual(duplicateFilter, {
      customerEmail: users[1].email,
      serviceId: serviceId.toString(),
      status: { $in: ["requested", "accepted", "in-progress"] },
    });
    assert.equal(createCalls, 0);
  } finally {
    Service.findById = originalFindById;
    Booking.findOne = originalFindOne;
    Booking.create = originalCreate;
  }
});

test("technicians and admins cannot create customer bookings", async () => {
  resetUsers();
  let serviceLookups = 0;
  const originalFindById = Service.findById;
  Service.findById = async () => {
    serviceLookups += 1;
    return null;
  };
  const body = {
    serviceId: new mongoose.Types.ObjectId().toString(),
    customerPhone: "0000000000",
    address: "Test address",
    preferredDate: dhakaDateOffset(1),
    problemDescription: "The screen is damaged and needs repair.",
  };

  try {
    for (const user of [users[0], users[2]]) {
      const response = await request("/booking", {
        method: "POST",
        token: tokenFor(user),
        body,
      });
      assert.equal(response.status, 403);
    }
    assert.equal(serviceLookups, 0);
  } finally {
    Service.findById = originalFindById;
  }
});

test("public service search covers listing fields and escapes regex input", async () => {
  resetUsers();
  let filter;
  Service.find = (query) => {
    filter = query;
    return sortedRows([]);
  };

  const response = await request(
    "/services?search=Mirpur&category=Smartphone&mode=Home%20Visit&sort=price-low"
  );
  assert.equal(response.status, 200);
  assert.deepEqual(filter, {
    approvalStatus: "approved",
    isAvailable: true,
    category: "Smartphone",
    serviceMode: "Home Visit",
    $or: [
      { title: /Mirpur/i },
      { category: /Mirpur/i },
      { description: /Mirpur/i },
      { technicianName: /Mirpur/i },
      { serviceArea: /Mirpur/i },
    ],
  });

  await request("/services?search=%5B");
  assert.equal(filter.$or[0].title.source, "\\[");
});

test("public service sorting maps supported choices to database sort fields", async () => {
  resetUsers();
  const sortOptions = [];
  Service.find = () => ({
    sort(criteria) {
      sortOptions.push(criteria);
      return Promise.resolve([]);
    },
  });

  for (const sort of ["price-low", "price-high", "newest"]) {
    const response = await request(`/services?sort=${sort}`);
    assert.equal(response.status, 200);
  }
  assert.deepEqual(sortOptions, [
    { basePrice: 1 },
    { basePrice: -1 },
    { createdAt: -1 },
  ]);
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
    approvalStatus: "pending",
    isAvailable: true,
  };
  Service.findByIdAndUpdate = async (id, update) => {
    serviceUpdate = { id, update };
    existingService.approvalStatus = update.$set.approvalStatus;
    return { ...existingService };
  };

  const invalid = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { approvalStatus: "published" },
  });
  const invalidId = await request("/api/admin/services/not-an-object-id/approval", {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { approvalStatus: "approved" },
  });
  const unauthorized = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[1]),
    body: { approvalStatus: "approved" },
  });
  assert.equal(serviceUpdate, undefined);
  const approved = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { approvalStatus: "approved" },
  });
  const result = await approved.json();

  assert.equal(invalid.status, 400);
  assert.equal(invalidId.status, 400);
  assert.deepEqual(await invalidId.json(), { message: "Invalid service ID" });
  assert.equal(unauthorized.status, 403);
  assert.equal(approved.status, 200);
  assert.equal(result.service.approvalStatus, "approved");
  assert.equal(result.service.isAvailable, true);
  assert.deepEqual(serviceUpdate.update, { $set: { approvalStatus: "approved" } });

  const rejected = await request(`/api/admin/services/${serviceId}/approval`, {
    method: "PATCH",
    token: tokenFor(users[0]),
    body: { approvalStatus: "rejected" },
  });
  const rejectedResult = await rejected.json();

  assert.equal(rejected.status, 200);
  assert.equal(rejectedResult.service.approvalStatus, "rejected");
  assert.equal(rejectedResult.service.isAvailable, true);
  assert.deepEqual(serviceUpdate.update, { $set: { approvalStatus: "rejected" } });
});

test("malformed service IDs are rejected before database lookups", async () => {
  resetUsers();
  const originalFindById = Service.findById;
  let lookups = 0;
  Service.findById = async () => {
    lookups += 1;
    throw new Error("Malformed ID reached MongoDB");
  };

  try {
    const responses = await Promise.all([
      request("/services/not-an-object-id"),
      request("/services/not-an-object-id", {
        method: "PATCH",
        token: tokenFor(users[2]),
        body: { title: "Test" },
      }),
      request("/services/not-an-object-id", {
        method: "DELETE",
        token: tokenFor(users[2]),
      }),
      request("/services/not-an-object-id/availability", {
        method: "PATCH",
        token: tokenFor(users[2]),
        body: { isAvailable: true },
      }),
    ]);

    for (const response of responses) {
      assert.equal(response.status, 400);
      assert.deepEqual(await response.json(), {
        message: "Invalid service ID",
      });
    }
    assert.equal(lookups, 0);

    const unauthenticated = await request("/services/not-an-object-id", {
      method: "PATCH",
    });
    assert.equal(unauthenticated.status, 401);
  } finally {
    Service.findById = originalFindById;
  }
});

test("technician service listing is handled before the dynamic ID route", async () => {
  resetUsers();
  let filter;
  Service.find = (query) => {
    filter = query;
    return sortedRows([]);
  };

  const response = await request("/services/mine", {
    token: tokenFor(users[2]),
  });

  assert.equal(response.status, 200);
  assert.deepEqual(filter, { technicianEmail: users[2].email });
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

test("service details return the requested existing record only when public", async () => {
  resetUsers();
  const serviceId = new mongoose.Types.ObjectId();
  const service = {
    _id: serviceId,
    title: "Existing service",
    technicianEmail: users[2].email,
    approvalStatus: "approved",
    isAvailable: true,
  };
  Service.findById = async (id) => {
    assert.equal(id, serviceId.toString());
    return service;
  };

  try {
    const response = await request(`/services/${serviceId}`);
    const result = await response.json();

    assert.equal(response.status, 200);
    assert.equal(result._id, serviceId.toString());
    assert.equal(result.title, service.title);
    assert.deepEqual(result.technicianProfile, {
      name: users[2].name,
      image: users[2].image,
      area: users[2].area,
      bio: users[2].bio,
    });

    service.approvalStatus = "pending";
    const pending = await request(`/services/${serviceId}`);
    assert.equal(pending.status, 404);

    service.approvalStatus = "approved";
    service.isAvailable = false;
    const unavailable = await request(`/services/${serviceId}`);
    assert.equal(unavailable.status, 404);
  } finally {
    Service.findById = originalServiceFindById;
  }
});

test("customers can book only an approved and available existing service", async () => {
  resetUsers();
  const serviceId = new mongoose.Types.ObjectId();
  const service = {
    _id: serviceId,
    title: "Existing service",
    category: "Smartphone",
    image: "",
    basePrice: 75,
    technicianName: "Test Technician",
    technicianEmail: users[2].email,
    approvalStatus: "pending",
    isAvailable: true,
  };
  let createdBooking;
  Service.findById = async () => service;
  Booking.findOne = async () => null;
  Booking.create = async (input) => {
    createdBooking = input;
    return { _id: new mongoose.Types.ObjectId(), ...input };
  };
  const body = {
    serviceId: serviceId.toString(),
    customerPhone: "0000000000",
    address: "Test address",
    preferredDate: dhakaDateOffset(0),
    problemDescription: "The screen is damaged and needs repair.",
  };
  const customerToken = tokenFor(users[1]);

  try {
    const pending = await request("/booking", {
      method: "POST",
      token: customerToken,
      body,
    });
    assert.equal(pending.status, 400);
    assert.equal(createdBooking, undefined);

    service.approvalStatus = "approved";
    service.isAvailable = false;
    const unavailable = await request("/booking", {
      method: "POST",
      token: customerToken,
      body,
    });
    assert.equal(unavailable.status, 400);
    assert.equal(createdBooking, undefined);

    service.isAvailable = true;
    const booked = await request("/booking", {
      method: "POST",
      token: customerToken,
      body,
    });
    const result = await booked.json();

    assert.equal(booked.status, 201);
    assert.equal(createdBooking.serviceId, serviceId.toString());
    assert.equal(createdBooking.serviceTitle, service.title);
    assert.equal(createdBooking.serviceImage, service.image);
    assert.equal(createdBooking.category, service.category);
    assert.equal(createdBooking.basePrice, service.basePrice);
    assert.equal(createdBooking.technicianName, service.technicianName);
    assert.equal(createdBooking.customerEmail, users[1].email);
    assert.equal(createdBooking.technicianEmail, users[2].email);
    assert.equal(createdBooking.customerName, users[1].name);
    assert.equal(createdBooking.customerPhone, body.customerPhone);
    assert.equal(createdBooking.address, body.address);
    assert.equal(createdBooking.preferredDate, body.preferredDate);
    assert.equal(createdBooking.finalAmount, service.basePrice);
    assert.equal(result.status, "requested");
    assert.equal(result.paymentStatus, "unpaid");
  } finally {
    Service.findById = originalServiceFindById;
    Booking.findOne = originalBookingFindOne;
    Booking.create = originalBookingCreate;
  }
});

test("technician mutations return the raw records consumed by dashboard callers", async () => {
  resetUsers();
  const serviceId = new mongoose.Types.ObjectId();
  const bookingId = new mongoose.Types.ObjectId();
  const service = {
    _id: serviceId,
    title: "Existing service",
    category: "Smartphone",
    description: "Repair and replacement service.",
    image: "https://example.test/service.jpg",
    basePrice: 75,
    estimatedDuration: "2 hours",
    serviceMode: "Home Visit",
    serviceArea: "Mirpur",
    technicianName: users[2].name,
    technicianEmail: users[2].email,
    approvalStatus: "pending",
    isAvailable: true,
    async save() {
      return this;
    },
  };
  const booking = {
    _id: bookingId,
    technicianEmail: users[2].email,
    status: "requested",
    async save() {
      return this;
    },
  };
  Service.create = async (input) => ({ _id: serviceId, ...input });
  Service.findById = async (id) => {
    assert.equal(id, serviceId.toString());
    return service;
  };
  Booking.findById = async (id) => {
    assert.equal(id, bookingId.toString());
    return booking;
  };

  try {
    const technicianToken = tokenFor(users[2]);
    const createResponse = await request("/services", {
      method: "POST",
      token: technicianToken,
      body: {
        title: service.title,
        category: service.category,
        description: service.description,
        image: service.image,
        basePrice: service.basePrice,
        estimatedDuration: service.estimatedDuration,
        serviceMode: service.serviceMode,
        serviceArea: service.serviceArea,
      },
    });
    const created = await createResponse.json();
    assert.equal(createResponse.status, 201);
    assert.equal(created._id, serviceId.toString());
    assert.equal(created.approvalStatus, "pending");
    assert.equal("service" in created, false);

    const updateResponse = await request(`/services/${serviceId}`, {
      method: "PATCH",
      token: technicianToken,
      body: {
        title: "Updated service",
        category: service.category,
        description: service.description,
        image: service.image,
        basePrice: service.basePrice,
        estimatedDuration: service.estimatedDuration,
        serviceMode: service.serviceMode,
        serviceArea: service.serviceArea,
      },
    });
    const updated = await updateResponse.json();
    assert.equal(updateResponse.status, 200);
    assert.equal(updated._id, serviceId.toString());
    assert.equal(updated.approvalStatus, "pending");
    assert.equal("service" in updated, false);

    const availabilityResponse = await request(
      `/services/${serviceId}/availability`,
      {
        method: "PATCH",
        token: technicianToken,
        body: { isAvailable: false },
      }
    );
    const availability = await availabilityResponse.json();
    assert.equal(availabilityResponse.status, 200);
    assert.equal(availability._id, serviceId.toString());
    assert.equal(availability.isAvailable, false);
    assert.equal("service" in availability, false);

    const statusResponse = await request(`/booking/${bookingId}/status`, {
      method: "PATCH",
      token: technicianToken,
      body: { status: "accepted" },
    });
    const status = await statusResponse.json();
    assert.equal(statusResponse.status, 200);
    assert.equal(status._id, bookingId.toString());
    assert.equal(status.status, "accepted");
    assert.equal("booking" in status, false);
  } finally {
    Service.create = originalServiceCreate;
    Service.findById = originalServiceFindById;
    Booking.findById = originalBookingFindById;
  }
});
