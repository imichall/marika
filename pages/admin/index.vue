<template>
  <div class="w-full">
    <!-- Top bar -->
    <div
      class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-16 z-30"
    >
      <div class="flex items-center space-x-4">
        <h1 class="text-xl lg:text-2xl font-semibold text-gray-800 dark:text-white">
          Dashboard
        </h1>
        <span
          class="px-3 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium rounded-full hidden sm:inline-block"
        >
          Live
        </span>
      </div>
    </div>

    <div class="p-4 lg:p-8">
        <!-- Stats overview -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
        >
          <div
            v-for="stat in stats"
            :key="stat.name"
            class="bg-white dark:bg-gray-900 rounded-xl p-4 lg:p-6 border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 transition-all duration-300"
          >
            <div class="flex items-center justify-between">
              <span :class="[stat.iconBg, 'p-2 lg:p-3 rounded-lg']">
                <span class="material-icons-outlined" :class="stat.iconColor">{{
                  stat.icon
                }}</span>
              </span>
              <span :class="[stat.trendColor, 'text-sm font-medium']">{{
                stat.trend
              }}</span>
            </div>
            <h3 class="text-xl lg:text-2xl font-bold mt-4 text-gray-900 dark:text-white">{{ stat.value }}</h3>
            <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ stat.name }}</p>
          </div>
        </div>

        <!-- Poslední příspěvky ve fóru -->
        <div
          v-if="permissions.forum_view?.view && recentForumTopics.length > 0"
          class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 lg:p-6 mb-8"
        >
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span class="material-icons-outlined text-gray-400 dark:text-gray-500">forum</span>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Poslední příspěvky ve fóru</h2>
            </div>
            <NuxtLink
              to="/admin/forum"
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              Zobrazit vše
              <span class="material-icons-outlined text-sm">arrow_forward</span>
            </NuxtLink>
          </div>
          <div class="space-y-3">
            <NuxtLink
              v-for="topic in recentForumTopics"
              :key="topic.id"
              :to="`/admin/forum/${topic.slug || topic.id}`"
              class="flex items-start p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all duration-200 group"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                    {{ topic.title }}
                  </h3>
                  <span
                    v-if="topic.is_pinned"
                    class="material-icons-outlined text-yellow-600 text-sm"
                    title="Připnuto"
                  >
                    push_pin
                  </span>
                  <span
                    v-if="topic.is_locked"
                    class="material-icons-outlined text-orange-600 text-sm"
                    title="Zamčeno"
                  >
                    lock
                  </span>
                </div>
                <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  {{ topic.content.substring(0, 100) }}{{ topic.content.length > 100 ? "..." : "" }}
                </p>
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <template
                    v-for="tagSlug in (topic.tags || (topic.tag ? [topic.tag] : []))"
                    :key="tagSlug"
                  >
                    <span
                      v-if="getTagStyle(tagSlug)"
                      class="px-2 py-0.5 rounded-full text-xs font-medium border"
                      :style="getTagStyle(tagSlug)"
                    >
                      {{ getTagName(tagSlug) }}
                    </span>
                  </template>
                </div>
                <div class="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
                  <span class="flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">person</span>
                    {{ topic.created_by_name }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">schedule</span>
                    {{ formatDate(topic.created_at) }}
                  </span>
                  <span class="flex items-center gap-1">
                    <span class="material-icons-outlined text-sm">comment</span>
                    {{ topic.reply_count }}
                  </span>
                </div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 lg:p-6 mb-8">
          <div class="flex items-center gap-2 mb-4">
            <span class="material-icons-outlined text-gray-400 dark:text-gray-500">bolt</span>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Rychlé akce</h2>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.name"
              :to="action.to"
              class="flex items-center p-4 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition-all duration-200"
            >
              <span
                :class="[
                  action.iconBg,
                  action.iconColor,
                  'p-2 rounded-lg mr-3',
                ]"
              >
                <span class="material-icons-outlined">{{ action.icon }}</span>
              </span>
              <div class="text-left">
                <h3 class="font-medium text-gray-900 dark:text-white">{{ action.name }}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ action.description }}</p>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Main content grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          <!-- Recent Activity -->
          <div
            class="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 lg:p-6"
          >
            <div class="flex items-center justify-between mb-6">
              <div class="flex items-center gap-2">
                <span class="material-icons-outlined text-gray-400 dark:text-gray-500"
                  >history</span
                >
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Nedávná aktivita</h2>
              </div>
              <button
                @click="openAllActivities"
                class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                Zobrazit vše
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivity"
                :key="activity.id"
                @click="openActivityDetail(activity)"
                :class="[
                  'flex items-start p-3 lg:p-4 rounded-lg transition-all duration-200 cursor-pointer border-2',
                  activity.type === 'order'
                    ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 hover:bg-red-100/60 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800/50'
                    : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-indigo-200 dark:hover:border-indigo-700'
                ]"
              >
                <span :class="[activity.iconBg, 'p-2.5 rounded-lg mr-3 lg:mr-4 flex-shrink-0']">
                  <span
                    class="material-icons-outlined text-xl"
                    :class="activity.iconColor"
                  >
                    {{ activity.icon }}
                  </span>
                </span>
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ activity.title }}</p>
                      <p class="text-sm text-gray-700 dark:text-gray-300 mt-0.5 line-clamp-2">
                        {{ activity.description }}
                      </p>
                      <p v-if="activity.subtitle" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {{ activity.subtitle }}
                      </p>
                    </div>
                    <span
                      v-if="activity.type === 'order'"
                      class="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0"
                    >
                      Objednávka
                    </span>
                  </div>
                  <p class="text-xs text-gray-400 dark:text-gray-500 mt-2 flex items-center gap-1">
                    <span class="material-icons-outlined text-xs">schedule</span>
                    {{ activity.time }}
                  </p>
                </div>
              </div>
              <div
                v-if="recentActivity.length === 0"
                class="text-center text-gray-500 dark:text-gray-400 py-8"
              >
                <span class="material-icons-outlined text-4xl mb-2 block text-gray-300 dark:text-gray-600">history</span>
                Žádná nedávná aktivita
              </div>
            </div>

            <!-- Previous Versions -->
            <div class="mt-6 border-t border-gray-100 dark:border-gray-800 pt-6">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-2">
                  <span class="material-icons-outlined text-gray-400 dark:text-gray-500"
                    >new_releases</span
                  >
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Verze aplikace Marika</h2>
                </div>
                <NuxtLink
                  to="/admin/changelog"
                  class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                >
                  Zobrazit changelog
                </NuxtLink>
              </div>

              <div class="space-y-4">
                <!-- Main branch -->
                <div
                  v-if="mainBranch"
                  class="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium"
                      >
                        stable
                      </span>
                      <NuxtLink
                        :to="`/admin/changelog#${
                          mainBranch.tag || mainBranch.version
                        }`"
                        class="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        {{ mainBranch.version }}
                        <span v-if="mainBranch.tag" class="text-gray-500 dark:text-gray-400 ml-1">
                          ({{ mainBranch.tag }})
                        </span>
                      </NuxtLink>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >person</span
                        >
                        {{ mainBranch.author }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >schedule</span
                        >
                        {{ mainBranch.date }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {{ mainBranch.lastCommit?.substring(0, 100)
                    }}{{ mainBranch.lastCommit?.length > 100 ? "..." : "" }}
                  </p>
                </div>

                <!-- Dev branch -->
                <div
                  v-if="devBranch"
                  class="flex flex-col p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <span
                        class="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium"
                      >
                        dev
                      </span>
                      <NuxtLink
                        :to="`/admin/changelog#${
                          devBranch.tag || devBranch.version
                        }`"
                        class="text-sm text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200"
                      >
                        {{ devBranch.version }}
                        <span v-if="devBranch.tag" class="text-gray-500 dark:text-gray-400 ml-1">
                          ({{ devBranch.tag }})
                        </span>
                      </NuxtLink>
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >person</span
                        >
                        {{ devBranch.author }}
                      </span>
                      <span class="flex items-center gap-1">
                        <span class="material-icons-outlined text-sm"
                          >schedule</span
                        >
                        {{ devBranch.date }}
                      </span>
                    </div>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {{ devBranch.lastCommit?.substring(0, 100)
                    }}{{ devBranch.lastCommit?.length > 100 ? "..." : "" }}
                  </p>
                </div>

                <!-- Loading state -->
                <div v-if="versionLoading" class="flex justify-center py-4">
                  <div
                    class="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 dark:border-gray-400 border-t-transparent"
                  ></div>
                </div>

                <!-- Error state -->
                <div v-if="error" class="text-sm text-red-500 p-4">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- Nadcházející události -->
          <div
            class="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 lg:p-6 flex flex-col h-full"
          >
            <div class="flex items-center gap-2 mb-6">
              <span class="material-icons-outlined text-gray-400 dark:text-gray-500"
                >event_upcoming</span
              >
              <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Nadcházející události</h2>
            </div>
            <div class="space-y-4 overflow-y-auto flex-1 pr-2">
              <div
                v-for="concert in upcomingConcerts"
                :key="concert.id"
                class="flex items-start p-3 lg:p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 cursor-pointer"
                @click="openConcertDetail(concert)"
              >
                <div
                  class="flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-3 lg:mr-4"
                >
                  <span class="text-base lg:text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {{ new Date(concert.date).getDate() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0">
                  <h3 class="font-medium text-gray-900 dark:text-white truncate">
                    {{ concert.title }}
                  </h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{
                      new Date(concert.date).toLocaleDateString("cs-CZ", {
                        month: "long",
                        year: "numeric",
                      })
                    }}
                  </p>
                  <div class="flex items-center mt-1">
                    <span
                      class="material-icons-outlined text-sm text-gray-400 dark:text-gray-500 mr-1"
                      >location_on</span
                    >
                    <p class="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {{ concert.location }}
                    </p>
                  </div>
                </div>
                <div class="ml-2 lg:ml-4 flex-shrink-0">
                  <span
                    :class="[
                      concert.is_sold_out
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400',
                      'px-2 py-1 text-xs font-medium rounded-full',
                    ]"
                  >
                    {{ concert.is_sold_out ? "Vyprodáno" : "Volné vstupenky" }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  <!-- Modal pro všechny aktivity -->
  <div
    v-if="showAllActivities"
    class="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[80vh] overflow-hidden"
    >
      <div class="p-6 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Všechny aktivity</h2>
          <button
            @click="closeAllActivities"
            class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <span class="material-icons-outlined">close</span>
          </button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
        <div class="space-y-4">
          <div
            v-for="activity in allActivities"
            :key="activity.id"
            @click="openActivityDetail(activity)"
            class="flex items-start p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer"
          >
            <span :class="[activity.iconBg, 'p-2 rounded-lg mr-4']">
              <span class="material-icons-outlined" :class="activity.iconColor">
                {{ activity.icon }}
              </span>
            </span>
            <div>
              <p class="font-medium text-gray-900 dark:text-white">{{ activity.title }}</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ activity.description }}</p>
              <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ activity.time }}</p>
            </div>
          </div>
          <div
            v-if="allActivities.length === 0"
            class="text-center text-gray-500 dark:text-gray-400 py-8"
          >
            Žádné aktivity k zobrazení
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal pro detail koncertu -->
  <div
    v-if="selectedConcert"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="closeConcertDetail"
  >
    <div
      class="bg-white dark:bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      @click.stop
    >
      <div class="relative">
        <!-- Poster/obrázek koncertu jako header -->
        <div class="relative h-64 bg-gray-200">
          <picture v-if="selectedConcert.image">
            <source
              :srcset="getWebPUrl(selectedConcert.image)"
              type="image/webp"
            />
            <img
              :src="selectedConcert.image"
              :alt="selectedConcert.title"
              class="w-full h-full object-contain"
            />
          </picture>
          <picture v-else-if="selectedConcert.poster?.image_url">
            <source
              :srcset="getWebPUrl(selectedConcert.poster.image_url)"
              type="image/webp"
            />
            <img
              :src="selectedConcert.poster.image_url"
              :alt="selectedConcert.title"
              class="w-full h-full object-contain"
            />
          </picture>
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-indigo-50"
          >
            <span class="material-icons-outlined text-6xl text-indigo-200"
              >music_note</span
            >
          </div>
          <div
            class="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"
          ></div>
          <button
            @click="closeConcertDetail"
            class="absolute top-4 right-4 bg-black/40 hover:bg-black/60 w-10 h-10 rounded-full text-white hover:text-white transition-all duration-200 backdrop-blur-sm flex items-center justify-center group"
          >
            <span
              class="material-icons-outlined text-2xl transform group-hover:scale-110 transition-transform duration-200"
              >close</span
            >
          </button>
        </div>

        <!-- Obsah modalu -->
        <div class="p-8 -mt-8 relative">
          <div class="bg-white dark:bg-gray-900 rounded-t-xl shadow-lg p-6">
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                  {{ selectedConcert.title }}
                </h2>
                <p class="text-gray-500 dark:text-gray-400 mt-1">{{ selectedConcert.subtitle }}</p>
              </div>
              <div class="flex-shrink-0 ml-6">
                <div class="text-center">
                  <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {{ new Date(selectedConcert.date).getDate() }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{
                      new Date(selectedConcert.date).toLocaleDateString(
                        "cs-CZ",
                        { month: "long" }
                      )
                    }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ new Date(selectedConcert.date).getFullYear() }}
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-4">
              <!-- Čas a místo -->
              <div class="flex items-center text-gray-600 dark:text-gray-300">
                <span class="material-icons-outlined mr-2">schedule</span>
                <span>{{ selectedConcert.time }}</span>
                <span class="mx-3">•</span>
                <span class="material-icons-outlined mr-2">location_on</span>
                <span>{{ selectedConcert.description }}</span>
              </div>

              <!-- Skupina -->
              <div class="flex items-center text-gray-600 dark:text-gray-300">
                <span class="material-icons-outlined mr-2">group</span>
                <span>{{ selectedConcert.group_name }}</span>
              </div>

              <!-- Detailní popis -->
              <div
                class="text-gray-600 dark:text-gray-300 mt-4 prose prose-sm max-w-none dark:prose-invert"
                v-html="
                  formatDetailedDescription(
                    selectedConcert.detailed_description
                  )
                "
              ></div>

              <!-- Vstupné -->
              <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Vstupné</h3>
                <div
                  v-if="selectedConcert.price > 0"
                  class="flex items-baseline"
                >
                  <span class="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                    >{{ selectedConcert.price }} Kč</span
                  >
                  <span class="text-gray-500 dark:text-gray-400 ml-2">/ osoba</span>
                </div>
                <div
                  v-else-if="selectedConcert.is_voluntary"
                  class="text-gray-600 dark:text-gray-300"
                >
                  Dobrovolné vstupné
                </div>
                <div
                  v-else-if="selectedConcert.has_presale"
                  class="text-gray-600 dark:text-gray-300"
                >
                  Předprodej vstupenek
                  <p v-if="selectedConcert.presale_text" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {{ selectedConcert.presale_text }}
                  </p>
                </div>
              </div>

              <!-- Status vstupenek -->
              <div class="mt-6 flex items-center justify-between">
                <div class="flex items-center">
                  <span
                    :class="[
                      selectedConcert.is_sold_out
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800',
                      'px-3 py-1 rounded-full text-sm font-medium',
                    ]"
                  >
                    {{
                      selectedConcert.is_sold_out
                        ? "Vyprodáno"
                        : "Volné vstupenky"
                    }}
                  </span>
                  <span
                    v-if="selectedConcert.remaining_tickets"
                    class="ml-2 text-sm text-gray-500"
                  >
                    (Zbývá {{ selectedConcert.remaining_tickets }} vstupenek)
                  </span>
                </div>

                <button
                  @click="editConcert(selectedConcert)"
                  class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upravit koncert
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: "admin",
});

import AdminBreadcrumbs from "~/components/AdminBreadcrumbs.vue";
import { useRoute, useRouter } from "vue-router";
import { ref, onMounted, computed } from "vue";
import { useSupabaseClient } from "#imports";
import { useFormMessages } from "~/composables/useFormMessages";
import { useForum } from "~/composables/useForum";

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();

const { concerts, fetchConcerts } = useConcerts();
const { testimonials } = useTestimonials();
const galleryImages = useGallery()?.galleryImages || [];
const { socialMedia } = useSocialMedia();
const { orders, getAllOrders } = useTicketOrders();
const {
  version,
  lastCommit,
  loading: versionLoading,
  fetchGitHubInfo,
  commitUrl,
  author,
  date,
  mainBranch,
  devBranch,
  error,
} = useVersion();

// Přidám ref pro zprávy
const { messages, fetchAllMessages } = useFormMessages();

// Přidám ref pro fórum
const {
  topics: forumTopics,
  categories,
  tags,
  fetchTopics: fetchForumTopics,
  fetchCategories,
  fetchTags
} = useForum('admin');

// Stav oprávnění
const permissions = ref({
  concerts: {
    view: false,
    edit: false,
  },
  choir_groups: {
    view: false,
    edit: false,
  },
  gallery: {
    view: false,
    edit: false,
  },
  testimonials: {
    view: false,
    edit: false,
  },
  orders: {
    view: false,
    edit: false,
  },
  social_media: {
    view: false,
    edit: false,
  },
  contacts: {
    view: false,
    edit: false,
  },
  settings: {
    view: false,
    edit: false,
    manage: false,
  },
  users: {
    view: false,
    edit: false,
  },
  form_messages: {
    view: false,
  },
  audit: {
    view: false,
    manage: false,
  },
  chat: {
    view: false,
    manage: false,
  },
  media: {
    view: false,
  },
  forum_view: {
    view: false,
  },
  forum_create: {
    create: false,
  },
  forum_delete: {
    delete: false,
  },
  forum_categories: {
    manage: false,
  },
  forum_tags: {
    manage: false,
  },
});

// Načtení oprávnění
const loadPermissions = async () => {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data?.user?.email) return;

    // Získání role uživatele
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("id, role")
      .eq("email", user.data.user.email)
      .single();

    // Pro adminy nastavíme všechna oprávnění na true
    if (userRole.role === "admin") {
      Object.keys(permissions.value).forEach((section) => {
        Object.keys(permissions.value[section]).forEach((action) => {
          permissions.value[section][action] = true;
        });
      });
      return;
    }

    // Pro ostatní role načteme oprávnění z databáze
    const { data: userPermissions } = await supabase
      .from("user_permissions")
      .select(
        `
        permission_id,
        permissions:permission_id (
          section,
          action
        )
      `
      )
      .eq("role_id", userRole.id);

    // Resetujeme všechna oprávnění na false
    Object.keys(permissions.value).forEach((section) => {
      Object.keys(permissions.value[section]).forEach((action) => {
        permissions.value[section][action] = false;
      });
    });

    // Nastavíme oprávnění podle dat z databáze
    userPermissions?.forEach((permission) => {
      const section = permission.permissions.section;
      const action = permission.permissions.action;
      if (permissions.value[section]) {
        permissions.value[section][action] = true;
      }
    });
  } catch (err) {
    console.error("Error loading permissions:", err);
  }
};

// Načtení dat při mounted
onMounted(async () => {
  await Promise.all([
    getAllOrders(),
    fetchConcerts(),
    fetchGitHubInfo(),
    fetchAllMessages(),
  ]);

  // Načtení oprávnění
  await loadPermissions();

  // Načtení posledních témat z fóra (pokud má uživatel oprávnění), ale bez archivovaných
  if (permissions.value.forum_view?.view) {
    await fetchForumTopics({ status: "!archived" });
    await fetchCategories();
    await fetchTags();
  }
});

// Přidám computed properties pro počty objednávek
const pendingOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "pending")
      .length || 0
);

const completedOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "completed")
      .length || 0
);

const cancelledOrders = computed(
  () =>
    orders.value?.filter((order) => order.payment_status === "cancelled")
      .length || 0
);

// Přidám computed properties pro počty zpráv
const pendingMessages = computed(
  () =>
    messages.value?.filter((message) => message.status === "pending").length ||
    0
);

const approvedMessages = computed(
  () =>
    messages.value?.filter((message) => message.status === "approved").length ||
    0
);

// Funkce pro vyčištění chybové hlášky
const clearError = () => {
  router.replace({ query: {} });
};

// Stats data with real data
const stats = computed(() => [
  {
    name: "Aktivní koncerty",
    value:
      concerts.value?.filter((concert) => !concert.is_archived)?.length || "0",
    icon: "music_note",
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    name: "Čekající objednávky",
    value: pendingOrders.value || "0",
    icon: "pending_actions",
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    name: "Nové zprávy",
    value: pendingMessages.value || "0",
    icon: "mail",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    name: "Aktivní reference",
    value:
      testimonials.value?.filter((testimonial) => !testimonial.is_archived)
        ?.length || "0",
    icon: "star",
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
  },
]);

// Quick actions with permissions check
const quickActions = computed(() =>
  [
    permissions.value.concerts.edit && {
      name: "Přidat koncert",
      description: "Vytvořit novou událost",
      icon: "add_circle",
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
      to: "/admin/koncerty?action=add",
    },
    permissions.value.gallery.edit && {
      name: "Nahrát fotky",
      description: "Přidat do galerie",
      icon: "upload",
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      to: "/admin/galerie?action=upload",
    },
    permissions.value.orders.view && {
      name: "Správa objednávek",
      description: "Zkontrolovat platby",
      icon: "receipt",
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      to: "/admin/objednavky",
    },
    permissions.value.form_messages.view && {
      name: "Zprávy",
      description: "Odpovědět na dotazy",
      icon: "chat",
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      to: "/admin/zpravy",
    },
  ].filter(Boolean)
);

// Recent activity computed property
const recentActivity = computed(() => {
  const activities = [];

  // Přidáme pouze čekající objednávky (pending)
  orders.value?.filter(order => order.payment_status === 'pending').forEach((order) => {
    const concert = concerts.value?.find(c => c.id === order.concert_id);
    const concertTitle = concert?.title || "Neznámý koncert";
    const concertDate = concert?.date
      ? new Date(concert.date).toLocaleDateString("cs-CZ", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      : "";
    const concertLocation = concert?.location || "";

    activities.push({
      id: `order-${order.id}`,
      title: "Čekající objednávka",
      description: `${concertTitle}${concertDate ? ` - ${concertDate}` : ""}${concertLocation ? ` (${concertLocation})` : ""}`,
      subtitle: `${order.ticket_count} ${order.ticket_count === 1 ? "vstupenka" : order.ticket_count < 5 ? "vstupenky" : "vstupenek"} • ${order.customer_name || order.email}`,
      time: new Date(order.created_at).toLocaleString("cs-CZ"),
      icon: "confirmation_number",
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      link: `/admin/objednavky/${order.id}`,
      type: "order",
      date: new Date(order.created_at),
      data: order,
    });
  });

  // Přidáme všechny zprávy
  messages.value?.forEach((message) => {
    activities.push({
      id: `message-${message.id}`,
      title: "Nová zpráva",
      description:
        message.message.substring(0, 100) +
        (message.message.length > 100 ? "..." : ""),
      subtitle: `${message.name} • ${message.email}`,
      time: new Date(message.created_at).toLocaleString("cs-CZ"),
      icon: "mail",
      iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      link: `/admin/zpravy/${message.id}`,
      type: "message",
      date: new Date(message.created_at),
      data: message,
    });
  });

  // Seřadíme podle data sestupně (nejnovější první) a vrátíme pouze 5 nejnovějších
  return activities.sort((a, b) => b.date - a.date).slice(0, 5);
});

// Přidáme ref pro zobrazení modalu s kompletní aktivitou
const showAllActivities = ref(false);

// Funkce pro otevření modalu s kompletní aktivitou
const openAllActivities = () => {
  showAllActivities.value = true;
};

// Funkce pro zavření modalu
const closeAllActivities = () => {
  showAllActivities.value = false;
};

// Computed property pro všechny aktivity
const allActivities = computed(() => {
  const activities = [];

  // Přidáme pouze čekající objednávky (pending)
  orders.value?.filter(order => order.payment_status === 'pending').forEach((order) => {
    const concert = concerts.value?.find(c => c.id === order.concert_id);
    const concertTitle = concert?.title || "Neznámý koncert";
    const concertDate = concert?.date
      ? new Date(concert.date).toLocaleDateString("cs-CZ", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })
      : "";
    const concertLocation = concert?.location || "";

    activities.push({
      id: `order-${order.id}`,
      title: "Čekající objednávka",
      description: `${concertTitle}${concertDate ? ` - ${concertDate}` : ""}${concertLocation ? ` (${concertLocation})` : ""}`,
      subtitle: `${order.ticket_count} ${order.ticket_count === 1 ? "vstupenka" : order.ticket_count < 5 ? "vstupenky" : "vstupenek"} • ${order.customer_name || order.email}`,
      time: new Date(order.created_at).toLocaleString("cs-CZ"),
      icon: "confirmation_number",
      iconBg: "bg-red-50 dark:bg-red-900/20",
      iconColor: "text-red-600 dark:text-red-400",
      link: `/admin/objednavky/${order.id}`,
      type: "order",
      date: new Date(order.created_at),
      data: order,
    });
  });

  // Přidáme všechny zprávy
  messages.value?.forEach((message) => {
    activities.push({
      id: `message-${message.id}`,
      title: "Nová zpráva",
      description:
        message.message.substring(0, 100) +
        (message.message.length > 100 ? "..." : ""),
      subtitle: `${message.name} • ${message.email}`,
      time: new Date(message.created_at).toLocaleString("cs-CZ"),
      icon: "mail",
      iconBg: "bg-indigo-50 dark:bg-indigo-900/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
      link: `/admin/zpravy/${message.id}`,
      type: "message",
      date: new Date(message.created_at),
      data: message,
    });
  });

  // Seřadíme podle data sestupně (nejnovější první)
  return activities.sort((a, b) => b.date - a.date);
});

const emit = defineEmits(["order-click"]);

// Přidáme funkci pro otevření detailu
const openActivityDetail = (activity) => {
  if (activity.type === "order") {
    router.push(`/admin/objednavky?tab=list&order=${activity.data.id}`);
  } else if (activity.type === "message") {
    router.push(`/admin/zpravy?detail=${activity.data.id}`);
  }
};

// V script části přidáme computed property pro nadcházející koncerty
const upcomingConcerts = computed(() => {
  const now = new Date();
  return (concerts.value || [])
    .filter((concert) => {
      const concertDate = new Date(concert.date);
      return concertDate >= now && !concert.is_archived;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 4); // Zobrazíme maximálně 4 nejbližší koncerty
});

// V script části přidáme:
const selectedConcert = ref(null);

const openConcertDetail = (concert) => {
  console.log("Concert data:", {
    id: concert.id,
    title: concert.title,
    image: concert.image,
    poster: concert.poster,
    date: concert.date,
    description: concert.description,
    detailed_description: concert.detailed_description,
    // Add all other fields to see complete structure
    ...concert,
  });
  selectedConcert.value = concert;
};

const closeConcertDetail = () => {
  selectedConcert.value = null;
};

// V script části přidáme:
const supabaseUrl = "https://xsxqmjhzgzquvmqptxrw.supabase.co";

// V script části přidáme:
const formatDetailedDescription = (text) => {
  if (!text) return "";
  // Nahradíme markdown odkazy HTML odkazy
  return (
    text
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:text-indigo-800">$1</a>'
      )
      // Nahradíme nové řádky HTML značkami
      .replace(/\n/g, "<br>")
  );
};

// V script části přidáme:
const editConcert = (concert) => {
  closeConcertDetail(); // Zavřeme modal
  router.push({
    path: "/admin/koncerty",
    query: {
      action: "edit",
      concert: concert.id,
    },
  });
};

// V script části přidáme:
const getWebPUrl = (originalUrl) => {
  if (!originalUrl) return "";
  return originalUrl.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
};

// Posledních 5 příspěvků ve fóru (bez archivovaných)
const recentForumTopics = computed(() => {
  if (!forumTopics.value || forumTopics.value.length === 0) {
    return [];
  }
  return [...forumTopics.value]
    .filter((t) => t.status !== "archived")
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
});

// Formátování data
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("cs-CZ", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Překlad tagů
const getTagName = (tagSlug) => {
  const tag = tags.value.find((t) => t.slug === tagSlug);
  return tag ? tag.name : tagSlug;
};

const getTagStyle = (tagSlug) => {
  const tag = tags.value.find((t) => t.slug === tagSlug);
  if (!tag) return null;

  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return {
    backgroundColor: hexToRgba(tag.color, 0.1),
    color: tag.color,
    borderColor: tag.color,
  };
};
</script>

<style>
/* Add any custom styles here */
</style>
