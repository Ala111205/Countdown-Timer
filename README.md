**⏳ Countdown Timer with Persistent Alarms & Notifications**

      A modern multi-alarm countdown timer web application built using Vanilla JavaScript, IndexedDB, and Service Workers.
      
      Alarms persist across page reloads and browser restarts, and fire even when the tab is closed, using background notifications.

**Live Demo 👉** https://ala111205.github.io/Countdown-Timer/

**🚀 Features:**

**⏰ Alarm & Notification Limitations (Important)**

      This Countdown Timer uses Service Workers + Notifications API to trigger alarms and show notifications.

      ⚠️ Browser Limitation:

          Due to how modern browsers work, JavaScript timers cannot run reliably in the background when the website is fully closed.

**⏱️ Multi-Timer Support**

      Create multiple countdown timers

      Each timer works independently

      Add, start, stop, reset, or delete any timer

**💾 Persistent Storage (IndexedDB)**

      All alarms are stored in IndexedDB

      Timers survive:

      Page reloads

      Browser restarts

      Accidental tab closes

      Alarm state (draft, scheduled, stopped, fired) is preserved

**🔔 Background Notifications (Service Worker)**

      Uses Service Worker to trigger alarms

      Notifications fire even when the app is not open

      Clicking the notification:

      Stops alarm sound

      Updates UI state correctly

**🔊 Alarm Sound Control**

      Alarm sound plays when timer finishes

      Stops when:

        Stop button is clicked

        Reset button is clicked

        Notification is clicked

**🕒 Real-Time Clock**

      Displays current date & time

      12-hour format with AM / PM

**🖱️ Long-Press Delete**

      Press & hold (mouse or touch) on a timer to delete it

      Works on both desktop and mobile

**🛠️ Tech Stack:**

**Frontend**

      HTML5

      CSS3

      Vanilla JavaScript (ES Modules)

      IndexedDB – persistent alarm storage

      Service Workers – background alarms & notifications

      Notifications API
