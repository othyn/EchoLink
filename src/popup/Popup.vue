<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-5">
          <v-card-title class="text-h5">New Bookmark</v-card-title>
          <v-card-text>
            <v-form>
              <v-text-field
                v-model="bookmark.url"
                label="URL"
                outlined
                readonly
                :value="bookmark.url"
              ></v-text-field>
              <v-text-field
                v-model="bookmark.title"
                label="Title"
                outlined
                readonly
                :value="bookmark.title"
              ></v-text-field>
              <v-textarea
                v-model="bookmark.description"
                label="Description"
                outlined
                auto-grow
              ></v-textarea>
              <v-autocomplete
                v-model="bookmark.tags"
                :items="tags"
                label="Tags"
                multiple
                chips
                outlined
                clearable
              ></v-autocomplete>
              <v-autocomplete
                v-model="bookmark.list"
                :items="lists"
                label="List"
                outlined
                clearable
              ></v-autocomplete>
              <v-btn color="primary" @click="saveBookmark">Save</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
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
}
</script>
