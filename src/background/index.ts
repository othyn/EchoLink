chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'bookmarkWithEchoLink',
    title: 'Bookmark this link...',
    contexts: ['link'],
  })
})

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === 'bookmarkWithEchoLink') {
    chrome.storage.local.get('useLinkAceBookletForRightClick', (result) => {
      let useLinkAceBookletForRightClick = result.useLinkAceBookletForRightClick ?? false

      if (useLinkAceBookletForRightClick) {
        chrome.storage.local.get(['linkAceUrl'], (result) => {
          const linkAceUrl = result.linkAceUrl ?? ''

          chrome.tabs.create({
            url: `${linkAceUrl}/bookmarklet/add?u=${encodeURIComponent(info.linkUrl ?? '')}`,
          })
        })
      } else {
        chrome.storage.local.set({ contextMenuLink: info.linkUrl })

        // Opening the popup isn't allowed, and action.openPopup is only available to policy installed extensions.
        // This is the only option...
        chrome.windows.create({
          url: chrome.runtime.getURL('popup.html'),
          type: 'popup',
          width: 500,
          //   height: 400,
        })
      }
    })
  }
})
