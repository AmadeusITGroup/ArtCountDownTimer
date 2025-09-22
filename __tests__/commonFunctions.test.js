/**
 * Tests for commonFunctions.js
 */

// Mock any dependencies
jest.mock("electron", () => ({
  ipcRenderer: {
    invoke: jest.fn()
  }
}));

// Import the module to test
const commonFunctions = require("../src/scripts/commonFunctions");

describe("Common Functions", () => {
  beforeEach(() => {
    // Reset mocks between tests
    jest.clearAllMocks();
  });

  test("calculateDurationInMinutes calculates correctly", () => {
    // Test with same day, different hours
    const start1 = new Date("2023-01-01T10:00:00");
    const end1 = new Date("2023-01-01T11:30:00");
    expect(commonFunctions.calculateDurationInMinutes(start1, end1)).toBe(90);

    // Test with different days
    const start2 = new Date("2023-01-01T22:00:00");
    const end2 = new Date("2023-01-02T01:00:00");
    expect(commonFunctions.calculateDurationInMinutes(start2, end2)).toBe(180);
    
    // Test with same time (zero duration)
    const start3 = new Date("2023-01-01T10:00:00");
    const end3 = new Date("2023-01-01T10:00:00");
    expect(commonFunctions.calculateDurationInMinutes(start3, end3)).toBe(0);
  });

  test("calculateWorkingDays counts only weekdays", () => {
    // Monday to Friday (5 working days)
    const start1 = new Date("2023-01-02"); // Monday
    const end1 = new Date("2023-01-06");   // Friday
    expect(commonFunctions.calculateWorkingDays(start1, end1)).toBe(5);
    
    // Monday to next Monday (6 working days, excluding weekend)
    const start2 = new Date("2023-01-02"); // Monday
    const end2 = new Date("2023-01-09");   // Monday
    expect(commonFunctions.calculateWorkingDays(start2, end2)).toBe(6);
    
    // Friday to Monday (2 working days, excluding weekend)
    const start3 = new Date("2023-01-06"); // Friday
    const end3 = new Date("2023-01-09");   // Monday
    expect(commonFunctions.calculateWorkingDays(start3, end3)).toBe(2);
    
    // Same day (1 working day)
    const start4 = new Date("2023-01-02"); // Monday
    const end4 = new Date("2023-01-02");   // Monday
    expect(commonFunctions.calculateWorkingDays(start4, end4)).toBe(1);
  });
});
