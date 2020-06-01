// open port to the background.js
const port = chrome.runtime.connect({
    name: 'AddSuffix'
});

chrome.storage.sync.get(null, (data) => {
    console.info('Loaded Data from storage: ' + JSON.stringify(data));

    document.getElementById("add-form").addEventListener('submit', (e) => {
        e.preventDefault()
        saveUrl();
    });

    document.getElementById("clear-all").addEventListener('click', (e) => {
        e.preventDefault()
        removeAllUrls();
    });

    document.getElementById("switch").addEventListener('click', (e) => {
        e.preventDefault()
        data = {
            extEnabled: !data.extEnabled,
            values: {
                ...data.values
            }
        };

        chrome.storage.sync.set(data, () => {
            console.log('saved');
        });

        toggleSwitch(data.extEnabled);
        port.postMessage({ action: 'reload' });
    });


    const toggleSwitch = (status) => {
        const toggleSwitch = document.getElementById('toggle-switch');
        if (status) {
            toggleSwitch.setAttribute('checked', null);
        } else {
            toggleSwitch.removeAttribute('checked');
        }
    }

    const saveUrl = () => {
        let now = Date.now()
        const urlEl = document.getElementById("url");
        const suffixEl = document.getElementById("suffix");
        const url = urlEl.value;
        const suffix = suffixEl.value;

        if (suffix && url) {
            data = {
                extEnabled: data.extEnabled,
                values: {
                    ...data.values,
                    [now]: {url, suffix}
                }
            };
            chrome.storage.sync.set(data, () => {
                urlEl.value = '';
                suffixEl.value = '';
                port.postMessage({ action: 'reload' });
            });
            buildTable(data.values);
        } else {
            document.getElementById("form-error").classList.remove('hidden');
        }
    }

    const removeAllUrls = () => {
        const extEnabled = data.extEnabled;
        chrome.storage.sync.clear();
        chrome.storage.sync.set({extEnabled}, () => {
            buildTable();
            postMessage({ action: 'reload' })
        });
    }

    const buildTable = (data) => {
        const box = document.getElementById('table-wrapper');
        if (document.getElementById('table-data')) {
            document.getElementById('table-data').remove();
        }
        if (data) {
            const table = document.createElement('table');
            table.setAttribute('id', 'table-data')
            const tHead = document.createElement('thead');
            const thUrl = document.createElement('th');
            thUrl.innerText = 'URL';
            tHead.appendChild(thUrl);
            const thSuffix = document.createElement('th');
            thSuffix.innerText = 'Suffix';
            tHead.appendChild(thSuffix);
            const thDelete = document.createElement('th');
            thDelete.innerText = 'Delete';
            tHead.appendChild(thDelete);
            table.appendChild(tHead);

            const tBody = document.createElement('tbody');

            for (const item in data) {
                const row = document.createElement('tr');
                const url = document.createElement('td');
                url.innerText = data[item].url;
                const suffix = document.createElement('td');
                suffix.innerText = data[item].suffix;
                const del = document.createElement('td');
                del.setAttribute('data-id', item);
                del.innerText = 'TODO del';
                row.appendChild(url);
                row.appendChild(suffix);
                row.appendChild(del);
                tBody.appendChild(row);
            }

            table.appendChild(tBody);
            box.appendChild(table);
        } else {
            const noData = document.createElement('div');
            noData.setAttribute('id', 'table-data')
            noData.innerText = 'No Data';
            box.appendChild(noData);
        }
    }

    toggleSwitch(data.extEnabled);

    // generate table with existing urls
    buildTable(data.values);
});
