// Initialize butotn with users's prefered color
// let changeColor = document.getElementById("changeColor");

// chrome.storage.sync.get("color", ({ color }) => {
//   changeColor.style.backgroundColor = color;
// });

// When the button is clicked, inject setPageBackgroundColor into current page
// changeColor.addEventListener("click", async () => {
//   let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

//   chrome.scripting.executeScript({
//     target: { tabId: tab.id },
//     function: setPageBackgroundColor,
//   });
// });

// The body of this function will be execuetd as a content script inside the current page
// 1. 改變 body 背景顏色
/*
(() => {
  function setPageBackgroundColor() {
    chrome.storage.sync.get("color", ({ color }) => {
      document.body.style.backgroundColor = color;
    });
  }

  let buttonWrap = document.querySelector('.button-wrap');
  const presetButtonColors = ["#3aa757", "#e8453c", "#f9bb2d", "#4688f1"];

  function executeScript ({tab, callback}) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: callback,
    });
  }

  const fragment = document.createDocumentFragment()

  for (let color of presetButtonColors) {
    let colorButton = document.createElement('button')
    colorButton.dataset.color = color
    colorButton.style.backgroundColor = color
    colorButton.title = `色碼: ${color}`

    colorButton.addEventListener('click', async e => {
      const { dataset: { color } } = e.currentTarget
      chrome.storage.sync.set({ color });
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      executeScript({
        tab,
        callback: setPageBackgroundColor
      })
    })

    fragment.appendChild(colorButton)
  }

  buttonWrap.appendChild(fragment)

})();
*/

// 2. 打API 拿資料呈現
/*
(() => {
  function success (res) {
    const lists = res
    const fragment = document.createDocumentFragment()
    const userLists = document.querySelector('.user-lists')
    const start = 0
    const end = 20

    lists
      .slice(start, end)
      .map((list, idx) => {
      const div = document.createElement('div')
      const userNumber = idx + 1
      div.className = 'user-list'
      div.innerHTML = `
        <div class="user-title">
          <span class="user-no">No.${userNumber}:</span>
          <span>${list.title}</span>
        </div>
      `
      fragment.appendChild(div)
    })
    userLists.appendChild(fragment)
  }

  fetch('https://jsonplaceholder.typicode.com/todos')
    .then(res => { return res.json() })
    .then(success)
})();
*/

// 3. 取當前tab cookie
/*
(() => {
  const getCookieButton = document.querySelector('.js-getCookie')
  const cookieResult = document.querySelector('.cookie-result')
  function getCurrentTabCookies () {
    const currentCookies = document.cookie
    chrome.storage.sync.set({ currentCookies })
  }
  function showCookieResult () {
    chrome.storage.sync.get('currentCookies', result => {
      const { currentCookies } = result
      const fragment = document.createDocumentFragment()
      // 做新的資料結構
      const currentCookiesTable = currentCookies
        .split(';')
        .reduce((cookieTable, fullCookie) => {
            const [key, value] = fullCookie.split('=')
            cookieTable[key] = value
            return cookieTable
        }, {})
      // 做畫面
      for (const keyName in currentCookiesTable) {
        const cookieValue = currentCookiesTable[keyName]
        const div = document.createElement('div')
        div.innerHTML = `${keyName}=${cookieValue}`
        fragment.appendChild(div)
      }

      cookieResult.appendChild(fragment)
    })
  }
  getCookieButton.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: getCurrentTabCookies,
    });
    await showCookieResult()
  })
})();
*/

// 改成透過 background.js 拿當前 tab 的 cookie, 開啟 popup 直接就將 cookie 寫入畫面
/*
chrome.storage.sync.get('currentCookies', (result) => {
  try {
    const { currentCookies } = result
    console.log('currentCookies: ', currentCookies);
    const cookieResult = document.querySelector('.cookie-result')
    const fragment = document.createDocumentFragment()
    // 做新的資料結構
    const currentCookiesTable = currentCookies
      .split(';')
      .reduce((cookieTable, fullCookie) => {
          const [key, value] = fullCookie.split('=')
          cookieTable[key] = value
          return cookieTable
      }, {})
    // 做畫面
    for (const keyName in currentCookiesTable) {
      const cookieValue = currentCookiesTable[keyName]
      const div = document.createElement('div')
      div.innerHTML = `${keyName}=${cookieValue}`
      fragment.appendChild(div)
    }
    const now = new Date().toString()
    const nowDiv = document.createElement('div')
    nowDiv.style.marginTop = '5px'
    nowDiv.style.borderTop = '1px solid'
    nowDiv.textContent = `最後更新時間: ${now}`
    fragment.appendChild(nowDiv)

    cookieResult.appendChild(fragment)
  } catch (error) {
    console.log(error);
  }
})
*/

(() => {
  const saveBtn = document.querySelector('#save-btn')

  saveBtn.addEventListener('click', async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        try {
          const messageBlocks = document.querySelectorAll('[aria-live="polite"] > [jsname]'),
            roomName = document.querySelector('.u6vdEc.ouH3xe').textContent
          let dataText = ''

          function saveData (data) {
            const now = new Date(),
              yyyy = now.getFullYear(),
              mm = now.getMonth() + 1,
              dd = now.getDate(),
              textToBLOB = new Blob([data], { type: 'text/plain' }),
              sFileName = `${yyyy}-${mm}-${dd}-roomId-${roomName}.txt`;

            let newLink = document.createElement("a");
            newLink.download = sFileName;

            if (window.webkitURL != null) {
                newLink.href = window.webkitURL.createObjectURL(textToBLOB);
            } else {
                newLink.href = window.URL.createObjectURL(textToBLOB);
                newLink.style.display = "none";
                document.body.appendChild(newLink);
            }
            newLink.click();
          }
          // var messageHashTable = new Map()

          messageBlocks.forEach((el, idx) => {
            const name = el.querySelector('div:nth-child(1) > [class]').textContent,
                senderId = el.getAttribute('data-sender-id'),
                formateTime = el.querySelector('div:nth-child(1) > div:nth-child(2)').textContent,
                timestamp = el.getAttribute('data-timestamp'),
                hashKey = `${senderId}_${timestamp}`,
                messages = [];

            el.querySelector('[jsname]').querySelectorAll('div').forEach(_el => {
              messages.push(_el.textContent.replace(/\r?\n/g, '\\r\\n'))
            })

            dataText += (
              `${name},${senderId},${timestamp},${messages}` +
              '\r\n'
            )

            // messageHashTable.set(hashKey, {
            //     order: idx,
            //     name,
            //     formateTime,
            //     timestamp,
            //     messages
            // })

          })
          // console.log(dataText);
          saveData(dataText)
        } catch (error) {
          alert('您不在 google meet 聊天室內。')
        }
      },
    });
  })
})()

