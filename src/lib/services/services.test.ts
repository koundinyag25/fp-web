import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("@/utils/http", () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

import { http } from "@/utils/http";
import { deliveryService } from "./delivery";
import { driverService } from "./driver";
import { fleetService } from "./fleet";
import { inventoryService } from "./inventory";
import { locationService } from "./location";
import { movementService } from "./movement";
import { orderService } from "./order";
import { productService } from "./product";
import { shiftService } from "./shift";
import { vehicleService } from "./vehicle";

const m = http as unknown as { get: Mock; post: Mock; put: Mock; delete: Mock };

beforeEach(() => {
  vi.clearAllMocks();
  m.get.mockResolvedValue({ data: { items: [], nextCursor: null } });
  m.post.mockResolvedValue({ data: {} });
  m.put.mockResolvedValue({ data: {} });
  m.delete.mockResolvedValue({ data: {} });
});

describe("master-data services (location/product/driver/vehicle)", () => {
  const cases = [
    { name: "location", svc: locationService, base: "/locations" },
    { name: "product", svc: productService, base: "/products" },
    { name: "driver", svc: driverService, base: "/drivers" },
    { name: "vehicle", svc: vehicleService, base: "/vehicles" },
  ];

  it.each(cases)(
    "$name.list passes params and returns the page envelope",
    async ({ svc, base }) => {
      m.get.mockResolvedValue({
        data: { items: [{ _id: "1" }], nextCursor: "c" },
      });
      const res = await svc.list({ q: "x" });
      expect(m.get).toHaveBeenCalledWith(base, { params: { q: "x" } });
      expect(res).toEqual({ items: [{ _id: "1" }], nextCursor: "c" });
    },
  );

  it.each(cases)(
    "$name create/update/remove hit the right URLs",
    async ({ svc, base }) => {
      await svc.create({ name: "n" } as never);
      expect(m.post).toHaveBeenCalledWith(base, { name: "n" });
      await svc.update("id1", { name: "n2" } as never);
      expect(m.put).toHaveBeenCalledWith(`${base}/id1`, { name: "n2" });
      await svc.remove("id1");
      expect(m.delete).toHaveBeenCalledWith(`${base}/id1`);
    },
  );
});

describe("driverService GPS controls", () => {
  it("sends manual + auto-drive commands", async () => {
    await driverService.sendGps("d1");
    expect(m.post).toHaveBeenCalledWith("/drivers/d1/gps");
    await driverService.startDrive("d1");
    expect(m.post).toHaveBeenCalledWith("/drivers/d1/drive/start", {
      replay: false,
    });
    await driverService.stopDrive("d1");
    expect(m.post).toHaveBeenCalledWith("/drivers/d1/drive/stop");
  });

  it("fetches driver stats", async () => {
    m.get.mockResolvedValue({
      data: { sinceDays: 90, completed: 1, failed: 0, total: 1 },
    });
    await driverService.stats("d1");
    expect(m.get).toHaveBeenCalledWith("/drivers/d1/stats");
  });
});

describe("fleetService", () => {
  it("fetches active vehicles with params", async () => {
    m.get.mockResolvedValue({ data: [{ shiftId: "s1" }] });
    const res = await fleetService.active({ driverId: "d1" });
    expect(m.get).toHaveBeenCalledWith("/fleet/active", {
      params: { driverId: "d1" },
    });
    expect(res).toEqual([{ shiftId: "s1" }]);
  });
});

describe("shiftService", () => {
  it("today / start / end", async () => {
    // today/start send the client's LOCAL day so the driver resolves "today" in
    // the same frame the admin allocated in (the server default is UTC).
    const day = expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/);
    m.get.mockResolvedValue({ data: { date: "2026-06-14" } });
    await shiftService.today("d1");
    expect(m.get).toHaveBeenCalledWith("/shifts/today", {
      params: { driverId: "d1", date: day },
    });
    await shiftService.start("d1");
    expect(m.post).toHaveBeenCalledWith("/shifts", {
      driverId: "d1",
      date: day,
    });
    await shiftService.end("s1");
    expect(m.post).toHaveBeenCalledWith("/shifts/s1/end");
  });
});

describe("deliveryService", () => {
  it("complete / fail", async () => {
    await deliveryService.complete("dl1");
    expect(m.post).toHaveBeenCalledWith("/deliveries/dl1/complete");
    await deliveryService.fail("dl1", "no access");
    expect(m.post).toHaveBeenCalledWith("/deliveries/dl1/fail", {
      reason: "no access",
    });
  });
});

describe("order / movement / inventory services", () => {
  it("orderService.counts", async () => {
    m.get.mockResolvedValue({ data: { pending: 1 } });
    await orderService.counts({ from: "2026-06-01" });
    expect(m.get).toHaveBeenCalledWith("/orders/counts", {
      params: { from: "2026-06-01" },
    });
  });
  it("movementService.list", async () => {
    m.get.mockResolvedValue({ data: [] });
    await movementService.list({ productId: "p1" });
    expect(m.get).toHaveBeenCalledWith("/movements", {
      params: { productId: "p1" },
    });
  });
  it("inventoryService.get", async () => {
    m.get.mockResolvedValue({
      data: { thresholds: { low: 20, warn: 50 }, rows: [] },
    });
    await inventoryService.get();
    expect(m.get).toHaveBeenCalledWith("/inventory", { params: undefined });
  });
});
