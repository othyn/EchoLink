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
            <v-btn icon="mdi-refresh" variant="text" @click="settings.showing = true"></v-btn>
            <v-btn icon="mdi-cog" variant="text" @click="settings.showing = true"></v-btn>
          </template>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="bookmark.url"
                label="URL"
                density="compact"
                variant="outlined"
                readonly
              ></v-text-field>
              <v-text-field
                v-model="bookmark.title"
                label="Title"
                density="compact"
                variant="outlined"
                readonly
              ></v-text-field>
              <v-textarea
                v-model="bookmark.description"
                label="Description"
                density="compact"
                auto-grow
              ></v-textarea>
              <v-autocomplete
                v-model="bookmark.list"
                :items="lists"
                label="List"
                density="compact"
                clearable
              ></v-autocomplete>
              <v-autocomplete
                v-model="bookmark.tags"
                :items="tags"
                label="Tags"
                multiple
                chips
                density="compact"
                clearable
              ></v-autocomplete>
              <v-btn color="primary" class="mt-2" @click="saveBookmark">Save bookmark</v-btn>
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

            <v-btn variant="tonal" class="mt-3" @click="testApi">Test connection</v-btn>
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
      bookmark: {
        url: '',
        title: '',
        description: '',
        tags: [],
        list: null,
      },
      settings: {
        showing: false,
        linkAceUrl: '',
        apiToken: '',
      },
      tags: [],
      lists: [],
      snackBar: {
        showing: false,
        type: 'info',
        text: 'default text',
      },
    }
  },
  methods: {
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
      // console.error(error)
      this.showSnackBar('error', error.code + ': ' + error.message)
    },
    testApi(): void {
      axios.get('/api/v1/links').then(
        () => {
          this.showSuccess('Great! Everything appears to be working 👍')
        },
        (error) => {
          this.showAxiosError(error)
        },
      )
    },
    async fetchActiveTab() {
      try {
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true })

        if (tab) {
          this.bookmark.url = tab.url ?? ''
          this.bookmark.title = tab.title ?? ''
        }
      } catch (error) {
        this.showError('Failed to fetch active tab: ' + error)
      }
    },
    saveBookmark(): void {
      // Logic to save the bookmark
      console.log('Bookmark saved:', this.bookmark)
    },
  },
  watch: {
    'settings.linkAceUrl'(newUrl, oldUrl) {
      chrome.storage.sync.set({ linkAceUrl: newUrl })
      axios.defaults.baseURL = newUrl

      console.log('Updated linkAceUrl:', newUrl)
    },
    'settings.apiToken'(newToken, oldToken) {
      chrome.storage.sync.set({ apiToken: newToken })
      axios.defaults.headers.common['authorization'] = 'Bearer ' + newToken

      console.log('Updated apiToken:', newToken)
    },
  },
  mounted() {
    chrome.storage.sync.get(['linkAceUrl'], (result) => {
      let url = result.linkAceUrl ?? ''

      this.settings.linkAceUrl = url
      axios.defaults.baseURL = url

      console.log('Restored LinkAceUrl:', url)
    })

    chrome.storage.sync.get(['apiToken'], (result) => {
      let apiToken = result.apiToken ?? ''

      this.settings.apiToken = apiToken
      axios.defaults.headers.common['authorization'] = 'Bearer ' + apiToken

      console.log('Restored apiToken:', apiToken)
    })

    this.fetchActiveTab()
  },
}
</script>

<style>
@import './popup.css';
</style>
