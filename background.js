// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focuzd Pomodoro Timer installed');

  // Set default settings on installation
  chrome.storage.sync.get('pomodoroSettings', (data) => {
    if (!data.pomodoroSettings) {
      const defaultSettings = {
        focusTime: 25,
        breakTime: 5,
        longBreakTime: 15,
        cyclesCount: 4,
        currentCycle: 1,
        isRunning: false,
        timerMode: 'focus',
        timeRemaining: 25 * 60,
        notificationMessage: 'Time to take a break!',
        theme: 'light',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif'
      };

      chrome.storage.sync.set({ pomodoroSettings: defaultSettings });

// Handle timer completion
function handleTimerCompletion(settings) {
  // Stop the current timer
  clearAlarm();
  settings.isRunning = false;

  // Logic for cycling between focus and breaks
  if (settings.timerMode === 'focus') {
    // Check if we need a long break
    if (settings.currentCycle % settings.cyclesCount === 0) {
      settings.timerMode = 'longBreak';
      settings.timeRemaining = settings.longBreakTime * 60;
      showNotification('Long Break Time!', 'Great job completing a full set of cycles!');
    } else {
      settings.timerMode = 'break';
      settings.timeRemaining = settings.breakTime * 60;
      showNotification('Break Time!', settings.notificationMessage);
    }
  } else {
    // After break, go back to focus and increment cycle if coming from a break
    settings.timerMode = 'focus';
    settings.timeRemaining = settings.focusTime * 60;

    if (settings.timerMode === 'break' || settings.timerMode === 'longBreak') {
      settings.currentCycle = (settings.currentCycle % settings.cyclesCount) + 1;
    }

    showNotification('Focus Time!', 'Time to get back to work!');
  }

  // Save updated settings
  chrome.storage.sync.set({ pomodoroSettings: settings });

  // Auto-start the next phase
  if (settings.isRunning) {
    createAlarm();
  }
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Start Next Phase button clicked
    chrome.storage.sync.get('pomodoroSettings', (data) => {
      if (data.pomodoroSettings) {
        const settings = data.pomodoroSettings;
        settings.isRunning = true;
        chrome.storage.sync.set({ pomodoroSettings: settings });
        createAlarm();
      }
    });
  }
  // Clear the notification
  chrome.notifications.clear(notificationId);
});

// Create alarm for timer
function createAlarm() {
  // Clear any existing alarm
  clearAlarm();

  // Create new alarm that fires every second
  chrome.alarms.create('pomodoroTimer', {
    periodInMinutes: 1/60
  });
}

// Clear alarm
function clearAlarm() {
  chrome.alarms.clear('pomodoroTimer');
}
    }
  });
});

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroTimer') {
    chrome.storage.sync.get('pomodoroSettings', (data) => {
      if (data.pomodoroSettings) {
        const settings = data.pomodoroSettings;

        // Update timer and check if it's completed
        if (settings.timeRemaining > 0) {
          settings.timeRemaining--;
          chrome.storage.sync.set({ pomodoroSettings: settings });
        } else {
          handleTimerCompletion(settings);
        }
      }
    });
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showNotification') {
    showNotification(message.title, message.message);
  }
  return true;
});


// Show notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'images/icon128.png',
    title: title,
    message: message,
    buttons: [
      {
        title: 'Start Next Phase'
      },
      {
        title: 'Dismiss'
      }
    ],
    requireInteraction: true
  });
}
