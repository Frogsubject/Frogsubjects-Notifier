// ==UserScript==
// @name         𝐅𝐫𝐨𝐠𝐬𝐮𝐛𝐣𝐞𝐜𝐭'𝐬 𝐍𝐨𝐭𝐢𝐟𝐢𝐞𝐫
// @namespace    http://tampermonkey.net/
// @version      7.0
// @description  Show a notification when messages appear and update the title with the number of messages
// @match        https://scratch.mit.edu/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let lastNotificationCount = localStorage.getItem('lastNotificationCount')
        ? parseInt(localStorage.getItem('lastNotificationCount'))
        : -1;
    var basetitle = document.title;

    function checkMessages() {
        const el = document.querySelector(".notificationsCount");
        if (!el) return;

        const count = parseInt(el.textContent) || 0;

        if (count !== lastNotificationCount) {
            if (count > lastNotificationCount && Notification.permission === "granted") {
                new Notification("Frogsubject's Notifier", {
                    body: `\nYou have ${count} new message${count > 1 ? "s" : ""}!\nScript by Frogsubject`,
                    icon: "https://i.imgur.com/mlILqrd.png",
                    requireInteraction: true
                });
            }
            lastNotificationCount = count;
            localStorage.setItem('lastNotificationCount', count);
        }

        document.title = count === 0 ? basetitle : `(${count}) ${basetitle}`;
    }

    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    checkMessages();

    const notificationsEl = document.querySelector(".notificationsCount");
    if (notificationsEl) {
        let debounceTimeout;
        const observer = new MutationObserver(() => {
            if (debounceTimeout) clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(checkMessages, 100);
        });
        observer.observe(notificationsEl, { childList: true, characterData: true, subtree: true });
    } else {
        setInterval(checkMessages, 1000);
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
            const count = data.count;
            let el = document.querySelector(".notificationsCount");
            if (!el) {
                el = document.createElement('div');
                el.className = "notificationsCount";
                el.style.display = 'none';
                document.body.appendChild(el);
            }
            el.textContent = count;

            checkMessages();
        })
        .catch(error => console.error("Error fetching notifications:", error));
    }

    setInterval(refreshNotifications, 5000);
})();