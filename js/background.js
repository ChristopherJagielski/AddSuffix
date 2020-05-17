function init() {
    // get data from storage
    chrome.storage.sync.get(null, function (result) {
        const data = result;
        console.info('Loaded Data from storage: ' + JSON.stringify(data));

        // for each url:suffix pair in data
        for (const item in data) {
            //get tabs from current window
            chrome.tabs.query({currentWindow: true}, function (tabs) {
                // and add a listener which will add suffix on url change
                tabs.forEach(tab => {
                    const {url, suffix} = data[item];
                    // const suffix = data[item].suffix;
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
    });
}

init();




