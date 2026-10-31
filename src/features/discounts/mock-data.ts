import { Discount } from "./types";

export const MOCK_DISCOUNTS: Discount[] = [
  {
    id: "disc_01HX9T001",
    code: "LAUNCH20",
    name: "Early Adopter Promotion",
    percentOff: 20,
    duration: "repeating",
    durationInMonths: 3,
    maxRedemptions: 100,
    timesRedeemed: 42,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "disc_01HX9T002",
    code: "STARTUP50",
    name: "Incubator Partner Grant",
    percentOff: 50,
    duration: "repeating",
    durationInMonths: 6,
    maxRedemptions: 25,
    timesRedeemed: 18,
    isActive: true,
    createdAt: "2024-03-01T00:00:00Z",
  },
];

