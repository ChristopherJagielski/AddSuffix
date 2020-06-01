chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.sync.set({extEnabled: false});
    }
});

// create port and listen to it, then reload init when message is send.
let activePort = chrome.runtime.onConnect.addListener((port) => {
   activePort = port;
   port.postMessage('Backend connected');

   port.onMessage.addListener((msg) => {
       if( msg.action === 'reload') {
           init();
       }
   })
});

function init() {
    // get data from storage
    chrome.storage.sync.get(null, function (data) {
        console.info('Loaded Data from storage: ' + JSON.stringify(data));
        if (data.extEnabled) {
            const storageItems = data.values;
            // for each url:suffix pair in data
            for (const item in storageItems) {
                //get tabs from current window
                chrome.tabs.query({currentWindow: true}, function (tabs) {
                    // and add a listener which will add suffix on url change
                    tabs.forEach(tab => {
                        const {url, suffix} = storageItems[item];
                        // do not add suffix if it already exists
                        if (tab.url.includes(url) && !tab.url.includes(suffix)) {
                            console.info(`Pattern  "${url} found.`);
                            chrome.tabs.onUpdated.addListener(function (tabId, {}, tab) {
                                if (!tab.url.includes(suffix) && tab.url.includes(url)) {
                                    chrome.tabs.update(tab.id, {url: tab.url + suffix});
                                }
                            });
                            // reload tab
                            chrome.tabs.reload(tab.id);
                        } else if (tab.url.includes(suffix)) {
                            console.log(`Suffix "${suffix}" exists. Tab ID: ${tab.id}.`, tab);
                        } else {
                            console.info(`Pattern "${url}" not found.`);
                        }
                    });
                });
            }
        }
    });
}

init();




