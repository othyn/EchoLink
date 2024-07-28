<template>
  <v-snackbar
    location="top"
    :color="snackBar.type"
    :text="snackBar.text"
    v-model="snackBar.showing"
  ></v-snackbar>

  <v-card variant="text" title="🔖 · New Bookmark" subtitle="Bookmark this page in LinkAce.">
    <template v-slot:append>
      <v-tooltip
        location="bottom"
        :text="
          bookmark.id > 0 ? 'Already bookmarked in LinkAce!' : 'Not yet bookmarked in LinkAce.'
        "
      >
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="bookmark.id > 0 ? 'mdi-check-decagram' : 'mdi-help-rhombus-outline'"
            :color="bookmark.id > 0 ? 'success' : 'warning'"
            variant="text"
            @click="visitActiveTabLink()"
            :disabled="loading"
            :loading="loading"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" text="Refresh">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-refresh"
            variant="text"
            @click="refresh()"
            :disabled="loading"
            :loading="loading"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" :text="settings.theme.title">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            :icon="settings.theme.icon"
            variant="text"
            @click="toggleTheme()"
            :disabled="loading"
          ></v-btn>
        </template>
      </v-tooltip>

      <v-tooltip location="bottom" text="Settings">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon="mdi-cog"
            variant="text"
            @click="settings.showing = true"
            :disabled="loading"
          ></v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-card-text>
      <v-form>
        <v-text-field
          v-model="bookmark.url"
          label="URL"
          density="comfortable"
          :disabled="loading"
          :loading="loading"
        ></v-text-field>

        <v-text-field
          v-model="bookmark.title"
          label="Title"
          density="comfortable"
          :disabled="loading"
          :loading="loading"
        ></v-text-field>

        <v-textarea
          v-model="bookmark.description"
          label="Description"
          rows="3"
          :disabled="loading"
          :loading="loading"
        ></v-textarea>

        <v-autocomplete
          v-model="bookmark.lists"
          :items="lists"
          label="List"
          multiple
          chips
          closable-chips
          clear-on-select
          auto-select-first
          hide-no-data
          clearable
          :disabled="loading"
          :loading="loading || loadingLists"
          @focus="fetchLists(false)"
        ></v-autocomplete>

        <v-autocomplete
          v-model="bookmark.tags"
          :items="tags"
          label="Tags"
          multiple
          chips
          closable-chips
          clear-on-select
          auto-select-first
          hide-no-data
          clearable
          hide-details="auto"
          :disabled="loading"
          :loading="loading || loadingTags"
          @focus="fetchTags(false)"
        ></v-autocomplete>
      </v-form>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions>
      <v-checkbox
        density="comfortable"
        hide-details="auto"
        label="Persist last used tags?"
        v-model="settings.persistTags"
        :disabled="loading"
      ></v-checkbox>

      <v-spacer></v-spacer>

      <v-btn
        text="Save bookmark"
        variant="tonal"
        color="primary"
        @click="saveBookmark"
        :disabled="loading"
        :loading="loading"
      ></v-btn>
    </v-card-actions>
  </v-card>

  <v-dialog v-model="settings.showing" transition="dialog-bottom-transition" fullscreen>
    <v-card
      prepend-icon="mdi-cog"
      title="Settings"
      :subtitle="'Find your API Token at ' + settings.linkAceUrl + '/settings'"
    >
      <v-card-text>
        <v-row dense>
          <v-col cols="12" md="4" sm="6">
            <v-text-field
              v-model="settings.linkAceUrl"
              density="comfortable"
              type="input"
              label="LinkAce URL"
              hint="https://linkace.example.com"
              required
              :disabled="loading"
              :loading="loading"
            ></v-text-field>

            <v-text-field
              v-model="settings.apiToken"
              density="comfortable"
              type="input"
              label="API Token"
              required
              :disabled="loading"
              :loading="loading"
            ></v-text-field>

            <v-btn variant="tonal" @click="testApi" :disabled="loading" :loading="loading"
              >Test connection
            </v-btn>

            <v-divider class="mt-4 mb-4"></v-divider>

            <v-text-field
              v-model="settings.timeout"
              density="comfortable"
              type="number"
              label="Connection Timeout"
              suffix="milliseconds"
              min="0"
              max="999999"
              required
              :disabled="loading"
              :loading="loading"
            ></v-text-field>

            <v-checkbox
              density="comfortable"
              hide-details="auto"
              label="Use LinkAce booklet for right click?"
              v-model="settings.useLinkAceBookletForRightClick"
              :disabled="loading"
            ></v-checkbox>

            <v-checkbox
              density="comfortable"
              hide-details="auto"
              label="Auto close window after submission?"
              v-model="settings.autoCloseAfterSubmit"
              :disabled="loading"
            ></v-checkbox>

            <v-checkbox
              density="comfortable"
              hide-details="auto"
              label="Trim YouTube URL's?"
              v-model="settings.trimYouTubeUrls"
              :disabled="loading"
            ></v-checkbox>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn
          text="Close"
          variant="tonal"
          color="primary"
          @click="settings.showing = false"
          :disabled="loading"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios'
import { isProxy, toRaw } from 'vue'

axios.defaults.timeout = 5000

function getDeviceTheme(): string {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

const themes: { [key: string]: { [key: string]: string } } = {
  device: {
    mode: 'device',
    next: 'light',
    vuetify: getDeviceTheme(),
    title: 'Follow device mode',
    icon: 'mdi-theme-light-dark',
  },
  light: {
    mode: 'light',
    next: 'dark',
    vuetify: 'light',
    title: 'Light mode',
    icon: 'mdi-weather-sunny',
  },
  dark: {
    mode: 'dark',
    next: 'device',
    vuetify: 'dark',
    title: 'Dark mode',
    icon: 'mdi-weather-night',
  },
}

export default {
  data() {
    return {
      loading: true,
      loadingLists: false,
      loadingTags: false,
      bookmark: {
        id: 0,
        url: '',
        title: '',
        description: '',
        lists: [],
        tags: [],
      },
      settings: {
        showing: false,
        theme: themes.device,
        linkAceUrl: '',
        apiToken: '',
        timeout: axios.defaults.timeout,
        useLinkAceBookletForRightClick: false,
        autoCloseAfterSubmit: false,
        trimYouTubeUrls: false,
        persistTags: false,
      },
      lists: [],
      tags: [],
      snackBar: {
        showing: false,
        type: 'info',
        text: 'default text',
      },
    }
  },
  methods: {
    setTheme(mode: string): void {
      this.settings.theme = themes[mode]
      chrome.storage.local.set({ theme: this.settings.theme })
      this.$vuetify.theme.global.name = this.settings.theme.vuetify
    },
    toggleTheme(): void {
      this.setTheme(this.settings.theme.next)
    },
    startLoading(): void {
      this.loading = true
    },
    finishLoading(): void {
      this.loading = false
    },
    showSnackBar(type: string, text: string): void {
      this.snackBar.showing = true
      this.snackBar.type = type
      this.snackBar.text = text
    },
    showSuccess(text: string): void {
      this.showSnackBar('success', text)
    },
    showError(text: string): void {
      this.showSnackBar('error', text)
    },
    showAxiosError(error: AxiosError): void {
      if (error.response) {
        switch (error.response.status) {
          // Form validation error
          case 422:
            var message = error.response.data.message

            // The only time we can get a 'url taken' in this app, as its always bootstrapped from an existing URL,
            //  is if the URL is in the trash. As the initial bootstrap search didn't find the URL as it doesn't
            //  search trashed URL's. That means the only time we can get that error is if the URL is in the trash.
            // Instead of doing a supplimentary API query and using up rate limited calls, just modify the message.
            if (message == 'The url has already been taken.') {
              message = 'The url has already been taken, and exists in your trash.'
            }

            this.showSnackBar('error', 'Error: ' + message)
            break
          // Rate limit error
          case 429:
            // LinkAce doesn't expose the headers via CORS, Access-Control-Expose-Headers, so Axios can't see them...
            // let rateLimitReset = error.response.headers.get('X-Ratelimit-Reset')
            // let remainingSeconds = Date.now() - rateLimitReset
            // this.showSnackBar('error', 'Rate limit reached, wait ' + remainingSeconds + ' seconds before trying again.')
            this.showSnackBar('error', 'Rate limit reached, please try again in a few seconds.')
            break
          default:
            break
        }
      } else {
        this.showSnackBar('error', error.code + ': ' + error.message)
      }
    },
    testApi(): void {
      this.startLoading()

      axios.get('/api/v1/links').then(
        () => {
          this.finishLoading()
          this.showSuccess('Great! Everything appears to be working 👍')
        },
        (error) => {
          this.finishLoading()
          this.showAxiosError(error)
        },
      )
    },
    delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    async fetchActiveTab() {
      try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        chrome.storage.local.get('contextMenuLink', (result) => {
          let contextMenuLink = result.contextMenuLink ?? ''

          if (contextMenuLink) {
            this.bookmark.url = contextMenuLink
          } else if (tab) {
            this.bookmark.url = tab.url ?? ''
            this.bookmark.title = tab.title ?? ''
          }

          chrome.storage.local.remove('contextMenuLink')

          if (this.bookmark.url) {
            if (this.bookmark.url[this.bookmark.url.length - 1] == '/') {
              this.bookmark.url = this.bookmark.url.substring(0, this.bookmark.url.length - 1)
            }

            // Trim's YouTube Url's of their playlist information and all other stuff,
            //  to try and reduce duplicates from URL permutations.
            if (this.settings.trimYouTubeUrls) {
              const match = this.bookmark.url.match(
                /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
              )

              if (match && match[1]) {
                this.bookmark.url = `https://www.youtube.com/watch?v=${match[1]}`
              }
            }

            this.fetchActiveTabLink()
          }
        })
      } catch (error) {
        this.showError('Failed to fetch url: ' + error)
      }
    },
    refresh() {
      this.fetchActiveTabLink()
      this.fetchLists(true)
      this.fetchTags(true)
    },
    visitActiveTabLink(): void {
      if (this.bookmark.id > 0) {
        chrome.tabs.create({ url: this.settings.linkAceUrl + '/links/' + this.bookmark.id })
      }
    },
    fetchActiveTabLink(): void {
      this.startLoading()

      axios
        .get('/api/v1/search/links', {
          params: { query: this.bookmark.url },
        })
        .then(
          (response) => {
            if (response.data.data && response.data.data.length > 0) {
              // The search doesn't return any tag or list data, so we need to do a supplemental direct pull via ID
              this.bookmark.id = response.data.data[0].id

              axios.get('/api/v1/links/' + this.bookmark.id).then(
                (response) => {
                  if (response.data) {
                    let link = response.data

                    this.bookmark.url = link.url
                    this.bookmark.title = link.title
                    this.bookmark.description = link.description

                    // If there are attached lists, we're gonna need them!
                    // Otherwise nothing is displayed in the element
                    // Sotring the id & name as an object causes issues in inconsistent data as Vuetify only stores the id as an array
                    if (link.lists.length > 0) {
                      this.fetchLists(false)
                    }

                    this.bookmark.lists = link.lists.map((list) => list.id)

                    // If there are attached tags, we're gonna need them!
                    // Otherwise nothing is displayed in the element
                    // Sotring the id & name as an object causes issues in inconsistent data as Vuetify only stores the id as an array
                    if (link.tags.length > 0) {
                      this.fetchTags(false)
                    }

                    this.bookmark.tags = link.tags.map((tag) => tag.id)
                  }

                  this.finishLoading()
                },
                (error) => {
                  this.finishLoading()
                  this.showAxiosError(error)
                },
              )
            } else {
              this.finishLoading()
            }
          },
          (error) => {
            this.finishLoading()
            this.showAxiosError(error)
          },
        )
    },
    // searchLists(value: string, query: string, item?: any) {
    //   // Cannot get custom-filter to work to do interactive search...
    // },
    // Really hacky and not performant, works for now until I get interactive search working...
    fetchLists(force: boolean): void {
      if (this.lists.length > 0 && !force) {
        return
      }

      if (this.loadingLists) {
        return
      }

      this.loadingLists = true

      axios.get('/api/v1/lists?per_page=0&order_by=name&order_dir=asc').then(
        (response) => {
          if (response.data.data && response.data.data.length > 0) {
            this.lists = response.data.data.map((list) => ({
              value: list.id,
              title: list.name,
            }))

            this.loadingLists = false
          }
        },
        (error) => {
          this.loadingLists = false
          this.showAxiosError(error)
        },
      )
    },
    // Really hacky and not performant, works for now until I get interactive search working...
    fetchTags(force: boolean): void {
      if (this.tags.length > 0 && !force) {
        return
      }

      if (this.loadingTags) {
        return
      }

      this.loadingTags = true

      axios.get('/api/v1/tags?per_page=0&order_by=name&order_dir=asc').then(
        (response) => {
          if (response.data.data && response.data.data.length > 0) {
            this.tags = response.data.data.map((tag) => ({
              value: tag.id,
              title: tag.name,
            }))

            this.loadingTags = false
          }
        },
        (error) => {
          this.loadingTags = false
          this.showAxiosError(error)
        },
      )
    },
    createBookmark(): void {
      if (this.bookmark.id > 0) {
        return
      }

      this.startLoading()

      axios
        .post('/api/v1/links', {
          url: this.bookmark.url,
          title: this.bookmark.title,
          description: this.bookmark.description,
          lists: this.bookmark.lists,
          tags: this.bookmark.tags,
          is_private: true,
          check_disabled: false,
        })
        .then(
          (response) => {
            this.finishLoading()
            this.showSuccess('Bookmark added! 🥳')

            // Set the ID so the next time the form is submitted it will use edit mode
            this.bookmark.id = response.data.id

            // Update the description, as the user may not set it, in which LinkAce will generate one
            this.bookmark.description = response.data.description

            if (this.settings.autoCloseAfterSubmit) {
              setTimeout(() => {
                window.close()
              }, 1000)
            }
          },
          (error) => {
            this.finishLoading()
            this.showAxiosError(error)
          },
        )
    },
    updateBookmark(): void {
      if (this.bookmark.id <= 0) {
        return
      }

      this.startLoading()

      axios
        .patch('/api/v1/links/' + this.bookmark.id, {
          url: this.bookmark.url,
          title: this.bookmark.title,
          description: this.bookmark.description,
          lists: this.bookmark.lists,
          tags: this.bookmark.tags,
          is_private: true,
          check_disabled: false,
        })
        .then(
          (response) => {
            this.finishLoading()
            this.showSuccess('Bookmark updated! 🥳')

            if (this.settings.autoCloseAfterSubmit) {
              setTimeout(() => {
                window.close()
              }, 1000)
            }
          },
          (error) => {
            this.finishLoading()
            this.showAxiosError(error)
          },
        )
    },
    saveBookmark(): void {
      // Update if the bookmark has an ID, otherwise create!
      if (this.bookmark.id > 0) {
        this.updateBookmark()
      } else {
        this.createBookmark()
      }
    },
  },
  watch: {
    'settings.linkAceUrl'(newUrl, oldUrl) {
      chrome.storage.local.set({ linkAceUrl: newUrl })
      axios.defaults.baseURL = newUrl
    },
    'settings.apiToken'(newToken, oldToken) {
      chrome.storage.local.set({ apiToken: newToken })
      axios.defaults.headers.common['authorization'] = 'Bearer ' + newToken
    },
    'settings.timeout'(newState, oldState) {
      chrome.storage.local.set({ timeout: newState })
      axios.defaults.timeout = newState
    },
    'settings.useLinkAceBookletForRightClick'(newState, oldState) {
      chrome.storage.local.set({ useLinkAceBookletForRightClick: newState })
    },
    'settings.autoCloseAfterSubmit'(newState, oldState) {
      chrome.storage.local.set({ autoCloseAfterSubmit: newState })
    },
    'settings.trimYouTubeUrls'(newState, oldState) {
      chrome.storage.local.set({ trimYouTubeUrls: newState })
    },
    'settings.persistTags'(newState, oldState) {
      chrome.storage.local.set({ persistTags: newState })

      if (newState) {
        chrome.storage.local.set({
          persistedTags: isProxy(this.bookmark.tags)
            ? toRaw(this.bookmark.tags)
            : this.bookmark.tags,
        })
      } else {
        chrome.storage.local.set({ persistedTags: [] })
      }
    },
    'bookmark.tags'(newState, oldState) {
      if (this.settings.persistTags) {
        chrome.storage.local.set({ persistedTags: isProxy(newState) ? toRaw(newState) : newState })
      } else {
        chrome.storage.local.set({ persistedTags: [] })
      }
    },
  },
  mounted() {
    chrome.storage.local.get('theme', (result) => {
      this.setTheme(result.theme.mode ?? themes.device.mode)
    })

    chrome.storage.local.get('linkAceUrl', (result) => {
      let url = result.linkAceUrl ?? ''

      this.settings.linkAceUrl = url
      axios.defaults.baseURL = url
    })

    chrome.storage.local.get('apiToken', (result) => {
      let apiToken = result.apiToken ?? ''

      this.settings.apiToken = apiToken
      axios.defaults.headers.common['authorization'] = 'Bearer ' + apiToken
    })

    chrome.storage.local.get('timeout', (result) => {
      this.settings.timeout = result.timeout ?? axios.defaults.timeout
      axios.defaults.timeout = this.settings.timeout
    })

    chrome.storage.local.get('useLinkAceBookletForRightClick', (result) => {
      this.settings.useLinkAceBookletForRightClick = result.useLinkAceBookletForRightClick ?? false
    })

    chrome.storage.local.get('autoCloseAfterSubmit', (result) => {
      this.settings.autoCloseAfterSubmit = result.autoCloseAfterSubmit ?? false
    })

    chrome.storage.local.get('trimYouTubeUrls', (result) => {
      this.settings.trimYouTubeUrls = result.trimYouTubeUrls ?? false

      // As this depends on the value of trimYouTubeUrls, only call the rest of the chain once its loaded!
      this.fetchActiveTab()
    })

    chrome.storage.local.get('persistTags', (result) => {
      this.settings.persistTags = result.persistTags ?? false
    })
    chrome.storage.local.get('persistedTags', (result) => {
      if (this.settings.persistTags) {
        this.fetchTags(false)
        this.bookmark.tags = result.persistedTags ?? []
      } else {
        this.bookmark.tags = []
      }
    })
  },
}
</script>

<style>
@import './popup.css';
</style>
