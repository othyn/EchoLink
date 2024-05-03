<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card variant="text" title="New Bookmark" subtitle="Bookmark this page in LinkAce.">
          <template v-slot:append>
            <v-btn icon="mdi-cog" variant="text" @click="dialog = true"></v-btn>
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
                v-model="bookmark.tags"
                :items="tags"
                label="Tags"
                multiple
                chips
                density="compact"
                clearable
              ></v-autocomplete>
              <v-autocomplete
                v-model="bookmark.list"
                :items="lists"
                label="List"
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

  <v-dialog v-model="dialog" transition="dialog-bottom-transition" fullscreen>
    <v-card prepend-icon="mdi-cog" title="Settings">
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

            <small class="text-caption text-medium-emphasis">
              You can find your API Token at: {{ settings.linkAceUrl }}/settings
            </small>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>

        <v-btn text="Close" variant="plain" @click="dialog = false"></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      bookmark: {
        url: '',
        title: '',
        description: '',
        tags: [],
        list: null,
      },
      settings: {
        linkAceUrl: '',
        apiToken: '',
      },
      tags: [], // Populate with available tags
      lists: [], // Populate with available lists
    }
  },
  methods: {
    saveBookmark() {
      // Logic to save the bookmark
      console.log('Bookmark saved:', this.bookmark)
    },
  },
  watch: {
    'settings.linkAceUrl'(newUrl, oldUrl) {
      console.log('Setting linkAceUrl:', newUrl)
      chrome.storage.sync.set({ linkAceUrl: newUrl })
    },
    'settings.apiToken'(newToken, oldToken) {
      console.log('Setting apiToken:', newToken)
      chrome.storage.sync.set({ apiToken: newToken })
    },
  },
  mounted() {
    chrome.storage.sync.get(['linkAceUrl'], (result) => {
      console.log('Restoring LinkAceUrl:', result.linkAceUrl)
      this.settings.linkAceUrl = result.linkAceUrl ?? ''
      console.log('Restored LinkAceUrl:', this.settings.linkAceUrl)
    })
    chrome.storage.sync.get(['apiToken'], (result) => {
      console.log('Restoring apiToken:', result.apiToken)
      this.settings.apiToken = result.apiToken ?? ''
      console.log('Restored apiToken:', this.settings.apiToken)
    })
  },
}
</script>

<style>
@import './popup.css';
</style>
