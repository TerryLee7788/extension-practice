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
