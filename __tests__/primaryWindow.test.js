/**
 * Tests for primaryWindow.js
 */

// Set up DOM elements needed by primaryWindow.js
document.body.innerHTML = `
  <div id="menu" style="display: none;"></div>
  <div class="bottom" style="opacity: 1;"></div>
  <div class="detail" style="opacity: 1;"></div>
  <div id="timer2-description"></div>
`;

// Mock window.electron before importing primaryWindow
global.window = Object.create(window);
global.window.electron = {
  minimizeWindow: jest.fn(),
  maximizeWindow: jest.fn(),
  remindMe: jest.fn(),
  onReminderAdded: jest.fn(callback => callback),
  onReminderTriggered: jest.fn(callback => callback),
  readConfig: jest.fn().mockResolvedValue({
    PI_1: {
      startDate: '2025-01-01',
      endDate: '2025-03-31',
      PI_PlanningAndInnovation: [
        { startDate: '2025-01-01', endDate: '2025-01-07', name: 'Planning' }
      ],
      PI_Iterations: [
        { startDate: '2025-01-01', endDate: '2025-01-14', name: 'Iteration 1' }
      ]
    }
  }),
  calculateDurationInMinutes: jest.fn((start, end) => {
    return ((new Date(end) - new Date(start)) / 1000 / 60);
  }),
  calculateWorkingDays: jest.fn(() => 10),
  identifyCurrentArtActivity: jest.fn(() => ({
    name: 'Test Activity',
    startDate: '2025-01-01',
    endDate: '2025-01-14'
  })),
  updateProgress: jest.fn()
};

// Mock getComputedStyle
window.getComputedStyle = jest.fn().mockImplementation((element) => {
  if (element.id === 'menu') {
    return { display: 'none' };
  }
  return { 
    display: 'flex',
    opacity: '1',
    filter: 'invert(0)',
    background: '#E3E5F2'
  };
});

// Now import the module after the mocks are set up
const primaryWindow = require('../src/scripts/primaryWindow');

describe('Primary Window Functions', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset DOM state
    document.getElementById('menu').style.display = 'none';
    document.getElementsByClassName('bottom')[0].style.opacity = '1';
    document.getElementsByClassName('detail')[0].style.opacity = '1';
  });

  test('isAlertSet correctly identifies alerts', () => {
    // No alerts
    expect(primaryWindow.isAlertSet({})).toBe(false);
    
    // Empty alerts array
    expect(primaryWindow.isAlertSet({ alerts: [] })).toBe(false);
    
    // No enabled alerts
    expect(primaryWindow.isAlertSet({ alerts: [{ timerEnabled: "false" }] })).toBe(false);
    
    // With enabled alerts
    expect(primaryWindow.isAlertSet({ alerts: [{ timerEnabled: "true" }] })).toBe(true);
  });

  test('formatTimeRemaining formats time correctly', () => {
    // Test with days
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;
    expect(primaryWindow.formatTimeRemaining(twoDaysMs)).toBe('2d 0h 0m');
    
    // Test with hours only
    const threeHoursMs = 3 * 60 * 60 * 1000;
    expect(primaryWindow.formatTimeRemaining(threeHoursMs)).toBe('3h 0m');
  });

  test('minimizeWindow calls electron.minimizeWindow', () => {
    primaryWindow.minimizeWindow();
    expect(window.electron.minimizeWindow).toHaveBeenCalled();
  });

  test('maximizeWindow calls electron.maximizeWindow', () => {
    primaryWindow.maximizeWindow();
    expect(window.electron.maximizeWindow).toHaveBeenCalled();
  });

  test('createSpanTooltipForAlert creates a span with correct text', () => {
    const span = primaryWindow.createSpanTooltipForAlert();
    expect(span.textContent).toBe('Click for Alert');
    expect(span.classList.contains('tooltip')).toBe(true);
  });

  

  test('generateBellIconSpan creates bell icon', () => {
  // Single bell - this is the only functionality needed
  const singleBell = primaryWindow.generateBellIconSpan();
  expect(singleBell.textContent).toBe('🔔');
});
});