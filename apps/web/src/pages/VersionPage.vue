<template>
  <div class="h-full overflow-y-auto p-4 md:p-6">
    <div class="max-w-3xl">
      <p class="text-sm text-muted">{{ copy.version.lead }}</p>
      <dl class="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-sm text-muted">{{ copy.version.current }}</dt>
          <dd class="mt-1 text-sm font-medium">{{ appVersion }}</dd>
        </div>
        <div>
          <dt class="text-sm text-muted">{{ copy.version.released }}</dt>
          <dd class="mt-1 text-sm font-medium">{{ releaseText }}</dd>
        </div>
      </dl>
      <div class="mt-5 flex flex-wrap items-center gap-2">
        <a class="btn" :href="projectRepo" target="_blank" rel="noopener noreferrer">{{ copy.version.repo }}</a>
        <button type="button" class="btn btn-primary" :disabled="checking" @click="check">
          {{ checking ? copy.version.checking : copy.version.check }}
        </button>
      </div>
      <p v-if="checkText" class="mt-4 text-sm" :class="checkFailed ? 'text-danger' : 'font-medium'" :role="checkFailed ? 'alert' : 'status'">
        {{ checkText }}
      </p>
      <p v-if="newerDate" class="mt-1 text-sm text-muted">{{ copy.version.foundOn }} {{ newerDate }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { version as packagedVersion } from "../../package.json";
import { copy } from "@/content";
import { projectRepo } from "@/release";
import { checkForUpdate, formatReleaseDate, loadPublishedAt } from "@/version";

const appVersion = (import.meta.env.VITE_APP_VERSION || "").trim() || packagedVersion;
const releaseText = ref(copy.version.loadingRelease);
const checking = ref(false);
const checkText = ref("");
const checkFailed = ref(false);
const newerDate = ref("");

onMounted(async () => {
  try {
    const published = await loadPublishedAt(appVersion);
    releaseText.value = published ? formatReleaseDate(published) || copy.version.releaseUnknown : copy.version.unpublished;
  } catch {
    releaseText.value = copy.version.releaseUnknown;
  }
});

async function check() {
  if (checking.value) return;
  checking.value = true;
  checkFailed.value = false;
  newerDate.value = "";
  checkText.value = "";
  try {
    const result = await checkForUpdate(appVersion);
    if (result.status === "newer") {
      checkText.value = `${copy.version.found} ${result.version}`;
      newerDate.value = formatReleaseDate(result.publishedAt);
      return;
    }
    if (result.status === "current") checkText.value = copy.version.latest;
    else checkText.value = copy.version.none;
  } catch {
    checkFailed.value = true;
    checkText.value = copy.version.failed;
  } finally {
    checking.value = false;
  }
}
</script>
