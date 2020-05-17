document.getElementById("add-form").addEventListener('submit', function (e) {
    e.preventDefault()
    saveUrl();
});

document.getElementById("clear-all").addEventListener('click', function (e) {
    e.preventDefault()
    removeAllUrls();
});

const saveUrl = () => {
    let now = Date.now()
    const url = document.getElementById("url").value;
    const suffix = document.getElementById("suffix").value;

    if (suffix && url) {
        chrome.storage.sync.set({[now]: {url, suffix}});
        chrome.runtime.reload();
    } else {
        document.getElementById("form-error").classList.remove('hidden');
    }
}

const removeAllUrls = () => {
    chrome.storage.sync.clear();
    chrome.runtime.reload();
}

// generate table with existing urls
chrome.storage.sync.get(null, function (result) {
    const box = document.getElementById('existing-data');
    if (Object.keys(result).length) {
        const table = document.createElement('table');
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

        for (const item in result) {
            const row = document.createElement('tr');
            const url = document.createElement('td');
            url.innerText = result[item].url;
            const suffix = document.createElement('td');
            suffix.innerText = result[item].suffix;
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
        noData.innerText = 'No Data';
        box.appendChild(noData);
    }
});
