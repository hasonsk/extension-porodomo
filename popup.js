// DOM Elements
const settingsButton = document.getElementById('settingsButton');
const closeButton = document.getElementById('closeButton');
const backButton = document.getElementById('backButton');
const timerContainer = document.getElementById('timerContainer');
const settingsContainer = document.getElementById('settingsContainer');
const timeDisplay = document.getElementById('timeDisplay');
const cycleDisplay = document.getElementById('cycleDisplay');
const sessionType = document.getElementById('sessionType');
const playButton = document.getElementById('playButton');
const resetButton = document.getElementById('resetButton');
const currentCycleDisplay = document.getElementById('currentCycle');
const totalCyclesDisplay = document.getElementById('totalCycles');
const lightThemeButton = document.getElementById('lightTheme');
const darkThemeButton = document.getElementById('darkTheme');
const notificationMessageInput = document.getElementById('notificationMessage');
const fontFamilySelect = document.getElementById('fontFamily');

// Settings elements
const focusTimeValue = document.getElementById('focusTimeValue');
const breakTimeValue = document.getElementById('breakTimeValue');
const longBreakTimeValue = document.getElementById('longBreakTimeValue');
const cyclesCountValue = document.getElementById('cyclesCountValue');
const fontSizeValue = document.getElementById('fontSizeValue');

// Default settings
const defaultSettings = {
  focusTime: 25,
  breakTime: 5,
  longBreakTime: 15,
  cyclesCount: 4,
  currentCycle: 1,
  isRunning: false,
  timerMode: 'focus', // 'focus', 'break', 'longBreak'
  timeRemaining: 25 * 60, // in seconds
  notificationMessage: 'Time to take a break!',
  theme: 'light',
  fontSize: 16,
  fontFamily: 'Arial, sans-serif'
};

// Current settings
let settings = {...defaultSettings};
let timerInterval = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  updateDisplay();
  setupEventListeners();
  applyTheme();
  applyFontSettings();
});

// Load settings from storage
function loadSettings() {
  chrome.storage.sync.get('pomodoroSettings', (data) => {
    if (data.pomodoroSettings) {
      settings = {...defaultSettings, ...data.pomodoroSettings};

      // Update settings display
      focusTimeValue.textContent = settings.focusTime;
      breakTimeValue.textContent = settings.breakTime;
      longBreakTimeValue.textContent = settings.longBreakTime;
      cyclesCountValue.textContent = settings.cyclesCount;
      notificationMessageInput.value = settings.notificationMessage;
      fontSizeValue.textContent = settings.fontSize;

      // Update dropdown
      const fontOption = Array.from(fontFamilySelect.options).find(
        option => option.value === settings.fontFamily
      );
      if (fontOption) {
        fontOption.selected = true;
      }
    }

    // Initialize timer display
    updateTimerDisplay();
    currentCycleDisplay.textContent = settings.currentCycle;
    totalCyclesDisplay.textContent = settings.cyclesCount;

    // Update play button icon
    playButton.innerHTML = settings.isRunning
      ? '<i class="fas fa-pause"></i>'
      : '<i class="fas fa-play"></i>';

    // If timer was running, restart it
    if (settings.isRunning) {
      startTimer();
    }
  });
}

// Save settings to storage
function saveSettings() {
  chrome.storage.sync.set({ pomodoroSettings: settings });
}

// Set up event listeners
function setupEventListeners() {
  // Navigation
  settingsButton.addEventListener('click', showSettings);
  closeButton.addEventListener('click', () => window.close());
  backButton.addEventListener('click', showTimer);

  // Timer controls
  playButton.addEventListener('click', toggleTimer);
  resetButton.addEventListener('click', resetTimer);

  // Settings controls
  document.querySelectorAll('.increment, .decrement').forEach(button => {
    button.addEventListener('click', handleSettingAdjustment);
  });

  // Theme selection
  lightThemeButton.addEventListener('click', () => changeTheme('light'));
  darkThemeButton.addEventListener('click', () => changeTheme('dark'));

  // Font settings
  fontFamilySelect.addEventListener('change', changeFontFamily);
  notificationMessageInput.addEventListener('change', updateNotificationMessage);
}

// Show settings panel
function showSettings() {
  timerContainer.classList.add('hidden');
  settingsContainer.classList.remove('hidden');
}

// Show timer panel
function showTimer() {
  settingsContainer.classList.add('hidden');
  timerContainer.classList.remove('hidden');
}

// Toggle timer (play/pause)
function toggleTimer() {
  if (settings.isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
}

// Start timer
function startTimer() {
  settings.isRunning = true;
  playButton.innerHTML = '<i class="fas fa-pause"></i>';
  saveSettings();

  // Clear any existing interval
  if (timerInterval) clearInterval(timerInterval);

  // Set up new interval
  timerInterval = setInterval(() => {
    settings.timeRemaining--;

    if (settings.timeRemaining <= 0) {
      handleTimerCompletion();
    }

    updateTimerDisplay();
    saveSettings();
  }, 1000);
}

// Pause timer
function pauseTimer() {
  settings.isRunning = false;
  playButton.innerHTML = '<i class="fas fa-play"></i>';
  clearInterval(timerInterval);
  timerInterval = null;
  saveSettings();
}

// Reset timer
function resetTimer() {
  pauseTimer();

  // Reset to focus mode
  settings.timerMode = 'focus';
  settings.timeRemaining = settings.focusTime * 60;
  settings.currentCycle = 1;

  updateDisplay();
  saveSettings();
}

// Handle timer completion
function handleTimerCompletion() {
  pauseTimer();

  // Logic for cycling between focus and breaks
  if (settings.timerMode === 'focus') {
    // Check if we need a long break
    if (settings.currentCycle % settings.cyclesCount === 0) {
      settings.timerMode = 'longBreak';
      settings.timeRemaining = settings.longBreakTime * 60;
      sendNotification('Long Break Time!', 'Great job completing a full set of cycles!');
    } else {
      settings.timerMode = 'break';
      settings.timeRemaining = settings.breakTime * 60;
      sendNotification('Break Time!', settings.notificationMessage);
    }
  } else {
    // After break, go back to focus and increment cycle if coming from a break
    settings.timerMode = 'focus';
    settings.timeRemaining = settings.focusTime * 60;

    if (settings.timerMode === 'break' || settings.timerMode === 'longBreak') {
      settings.currentCycle = (settings.currentCycle % settings.cyclesCount) + 1;
    }

    sendNotification('Focus Time!', 'Time to get back to work!');
  }

  // Auto-start the next phase
  startTimer();

  // Update display
  updateDisplay();
}

// Update the timer display
function updateTimerDisplay() {
  const minutes = Math.floor(settings.timeRemaining / 60);
  const seconds = settings.timeRemaining % 60;

  timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Update session type display
  switch (settings.timerMode) {
    case 'focus':
      sessionType.textContent = 'Focus Time';
      document.documentElement.style.setProperty('--primary-color', '#26a69a');
      break;
    case 'break':
      sessionType.textContent = 'Break Time';
      document.documentElement.style.setProperty('--primary-color', '#66bb6a');
      break;
    case 'longBreak':
      sessionType.textContent = 'Long Break';
      document.documentElement.style.setProperty('--primary-color', '#42a5f5');
      break;
  }

  // Update cycle display
  cycleDisplay.textContent = `- ${settings.currentCycle} -`;
  currentCycleDisplay.textContent = settings.currentCycle;
}

// Update all displays
function updateDisplay() {
  updateTimerDisplay();
  currentCycleDisplay.textContent = settings.currentCycle;
  totalCyclesDisplay.textContent = settings.cyclesCount;
}

// Handle setting adjustment (increment/decrement)
function handleSettingAdjustment(event) {
  const button = event.currentTarget;
  const settingName = button.dataset.setting;
  const isIncrement = button.classList.contains('increment');

  // Get current value and min/max constraints
  let value = settings[settingName];
  const minValues = {
    focusTime: 1,
    breakTime: 1,
    longBreakTime: 1,
    cyclesCount: 1,
    fontSize: 10
  };

  const maxValues = {
    focusTime: 60,
    breakTime: 30,
    longBreakTime: 60,
    cyclesCount: 10,
    fontSize: 24
  };

  // Update value
  if (isIncrement && value < maxValues[settingName]) {
    value++;
  } else if (!isIncrement && value > minValues[settingName]) {
    value--;
  }

  // Update setting
  settings[settingName] = value;

  // Update display
  document.getElementById(`${settingName}Value`).textContent = value;

  // If adjusting current timer mode duration, update remaining time
  if (
    (settingName === 'focusTime' && settings.timerMode === 'focus') ||
    (settingName === 'breakTime' && settings.timerMode === 'break') ||
    (settingName === 'longBreakTime' && settings.timerMode === 'longBreak')
  ) {
    settings.timeRemaining = value * 60;
    updateTimerDisplay();
  }

  // Update total cycles display
  if (settingName === 'cyclesCount') {
    totalCyclesDisplay.textContent = value;
    // Make sure current cycle is valid
    if (settings.currentCycle > value) {
      settings.currentCycle = value;
      currentCycleDisplay.textContent = value;
    }
  }

  // Apply font size change
  if (settingName === 'fontSize') {
    applyFontSettings();
  }

  saveSettings();
}

// Send notification
function sendNotification(title, message) {
  // Send message to background script to show notification
  chrome.runtime.sendMessage({
    action: 'showNotification',
    title: title,
    message: message
  });

  // Also show popup if not already open
  chrome.action.setPopup({ popup: 'popup.html' });
}

// Change theme
function changeTheme(theme) {
  settings.theme = theme;
  applyTheme();
  saveSettings();
}

// Apply theme
function applyTheme() {
  if (settings.theme === 'dark') {
    document.body.classList.add('dark-theme');
    darkThemeButton.classList.add('active');
    lightThemeButton.classList.remove('active');
  } else {
    document.body.classList.remove('dark-theme');
    lightThemeButton.classList.add('active');
    darkThemeButton.classList.remove('active');
  }
}

// Change font family
function changeFontFamily() {
  settings.fontFamily = fontFamilySelect.value;
  applyFontSettings();
  saveSettings();
}

// Update notification message
function updateNotificationMessage() {
  settings.notificationMessage = notificationMessageInput.value;
  saveSettings();
}

// Apply font settings
function applyFontSettings() {
  document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
  document.documentElement.style.setProperty('--font-family', settings.fontFamily);
}
