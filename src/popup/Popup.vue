<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-snackbar
          location="top"
          :color="snackBar.type"
          :text="snackBar.text"
          v-model="snackBar.showing"
        ></v-snackbar>

        <v-card variant="text" title="🔖 · New Bookmark" subtitle="Bookmark this page in LinkAce.">
          <template v-slot:append>
            <v-btn
              icon="mdi-refresh"
              variant="text"
              @click="checkCurrentBookmarkUrl()"
              :disabled="loading"
              :loading="loading"
            ></v-btn>

            <v-btn
              icon="mdi-cog"
              variant="text"
              @click="settings.showing = true"
              :disabled="loading"
            ></v-btn>
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
                clearable
                :disabled="loading"
                :loading="loading"
              ></v-autocomplete>

              <v-autocomplete
                v-model="bookmark.tags"
                :items="tags"
                label="Tags"
                multiple
                chips
                clearable
                :disabled="loading"
                :loading="loading"
              ></v-autocomplete>

              <v-btn
                color="primary"
                class="mt-2"
                @click="saveBookmark"
                :disabled="loading"
                :loading="loading"
                >Save bookmark</v-btn
              >
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>

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
              type="input"
              label="LinkAce URL"
              hint="https://linkace.example.com"
              required
            ></v-text-field>
          </v-col>

          <v-col cols="12" md="4" sm="6">
            <v-text-field
              v-model="settings.apiToken"
              type="input"
              label="API Token"
              required
            ></v-text-field>

            <v-btn
              variant="tonal"
              class="mt-3"
              @click="testApi"
              :disabled="loading"
              :loading="loading"
              >Test connection</v-btn
            >
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Close" variant="plain" @click="settings.showing = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import axios, { AxiosError } from 'axios'

axios.defaults.timeout = 5000

export default {
  data() {
    return {
      loading: true,
      bookmark: {
        url: '',
        title: '',
        description: '',
        lists: [],
        tags: [],
      },
      settings: {
        showing: false,
        linkAceUrl: '',
        apiToken: '',
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
      console.error(error)
      if (error.response && error.response.status == 429) {
        // LinkAce doesn't expose the headers via CORS, Access-Control-Expose-Headers, so Axios can't see them...
        // let rateLimitReset = error.response.headers.get('X-Ratelimit-Reset')
        // let remainingSeconds = Date.now() - rateLimitReset
        // this.showSnackBar('error', 'Rate limit reached, wait ' + remainingSeconds + ' seconds before trying again.')
        this.showSnackBar('error', 'Rate limit reached, please try again in a few seconds.')
      } else {
        this.showSnackBar('error', error.code + ': ' + error.message)
      }
    },
    testApi(): void {
      this.startLoading()

      axios.get('/api/v1/links').then(
        () => {
          this.showSuccess('Great! Everything appears to be working 👍')
          this.finishLoading()
        },
        (error) => {
          this.showAxiosError(error)
          this.finishLoading()
        },
      )
    },
    delay(ms: number) {
      return new Promise((resolve) => setTimeout(resolve, ms))
    },
    async fetchActiveTab() {
      try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (tab) {
          this.bookmark.url = tab.url ?? ''
          this.bookmark.title = tab.title ?? ''

          if (this.bookmark.url[this.bookmark.url.length - 1] == '/') {
            this.bookmark.url = this.bookmark.url.substring(0, this.bookmark.url.length - 1)
          }

          // Really stupid, but a small delay is required otherwise the current bookmark fetch doesn't work
          await this.delay(25)
          this.checkCurrentBookmarkUrl()
        }
      } catch (error) {
        this.showError('Failed to fetch active tab: ' + error)
      }
    },
    checkCurrentBookmarkUrl(): void {
      this.startLoading()

      axios
        .get('/api/v1/search/links', {
          params: { query: this.bookmark.url },
        })
        .then(
          (response) => {
            if (response.data.data && response.data.data.length > 0) {
              // The search doesn't return any tag or list data, so we need to do a supplemental direct pull via ID
              axios.get('/api/v1/links/' + response.data.data[0].id).then(
                (response) => {
                  if (response.data) {
                    let link = response.data

                    this.bookmark.url = link.url
                    this.bookmark.title = link.title
                    this.bookmark.description = link.description
                    this.bookmark.lists = link.lists.map((list) => ({
                      value: list.id,
                      title: list.name,
                    }))
                    this.bookmark.tags = link.tags.map((tag) => ({
                      value: tag.id,
                      title: tag.name,
                    }))
                  }

                  this.finishLoading()
                },
                (error) => {
                  this.showAxiosError(error)
                  this.finishLoading()
                },
              )
            } else {
              this.finishLoading()
            }
          },
          (error) => {
            this.showAxiosError(error)
            this.finishLoading()
          },
        )
    },
    saveBookmark(): void {},
  },
  watch: {
    'settings.linkAceUrl'(newUrl, oldUrl) {
      chrome.storage.sync.set({ linkAceUrl: newUrl })
      axios.defaults.baseURL = newUrl
    },
    'settings.apiToken'(newToken, oldToken) {
      chrome.storage.sync.set({ apiToken: newToken })
      axios.defaults.headers.common['authorization'] = 'Bearer ' + newToken
    },
  },
  mounted() {
    chrome.storage.sync.get(['linkAceUrl'], (result) => {
      let url = result.linkAceUrl ?? ''

      this.settings.linkAceUrl = url
      axios.defaults.baseURL = url
    })

    chrome.storage.sync.get(['apiToken'], (result) => {
      let apiToken = result.apiToken ?? ''

      this.settings.apiToken = apiToken
      axios.defaults.headers.common['authorization'] = 'Bearer ' + apiToken
    })

    this.fetchActiveTab()
  },
}
</script>

<style>
@import './popup.css';
</style>
