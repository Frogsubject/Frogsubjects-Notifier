// ==UserScript==
// @name         𝐅𝐫𝐨𝐠𝐬𝐮𝐛𝐣𝐞𝐜𝐭'𝐬 𝐍𝐨𝐭𝐢𝐟𝐢𝐞𝐫 (API Only)
// @namespace    http://tampermonkey.net/
// @version      7.3
// @description  Show a notification when messages appear and update the title with the number of messages using only the API count
// @match        https://scratch.mit.edu/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Retrieve stored last-notified count from localStorage (default to 0)
    let lastNotificationCount = localStorage.getItem('lastNotificationCount') !== null
        ? parseInt(localStorage.getItem('lastNotificationCount'))
        : 0;
    const basetitle = document.title;
    let apiCount = 0; // This variable will hold the API's current count

    // Check the API count and trigger a notification if the count has increased
    function checkNotifications() {
        if (apiCount !== lastNotificationCount) {
            if (apiCount > lastNotificationCount && Notification.permission === "granted") {
                new Notification("Frogsubject's Notifier", {
                    body: `\nYou have ${apiCount} new message${apiCount > 1 ? "s" : ""}!\nScript by Frogsubject`,
                    icon: "https://i.imgur.com/mlILqrd.png",
                    requireInteraction: true
                });
            }
            lastNotificationCount = apiCount;
            localStorage.setItem('lastNotificationCount', apiCount);
        }
        document.title = apiCount === 0 ? basetitle : `(${apiCount}) ${basetitle}`;
    }

    // Request notification permission if not already granted
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    const userName = 'frogsubject';
    function refreshNotifications() {
        const endpoint = `https://api.scratch.mit.edu/users/${userName}/messages/count`;
        fetch(endpoint, {
            mode: 'cors',
            headers: { 'Accept': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            apiCount = data.count;
            checkNotifications();
        })
        .catch(error => console.error("Error fetching notifications:", error));
    }

    // Refresh the notifications from the API every 5 seconds
    setInterval(refreshNotifications, 1000);
    // Do an immediate refresh when the script loads
    refreshNotifications();
})();
