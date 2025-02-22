<template>
  <div
    class="fixed bottom-4 right-4 z-40 flex flex-col bg-white rounded-lg shadow-xl w-96"
    :class="{ 'h-[32rem]': isOpen, 'h-12': !isOpen }"
  >
    <!-- Header -->
    <div
      class="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-lg cursor-pointer shadow-lg"
      @click="toggleChat"
    >
      <div class="flex items-center gap-3">
        <span class="material-icons-outlined text-xl">chat</span>
        <h3 class="font-semibold">Admin Chat</h3>
        <span
          v-if="onlineUsers.length > 0"
          class="px-2.5 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full font-medium"
        >
          {{ onlineUsers.length }} online
        </span>
      </div>
      <button
        class="focus:outline-none hover:bg-white/10 rounded-full p-1 transition-colors"
      >
        <span class="material-icons-outlined">
          {{ isOpen ? "expand_more" : "expand_less" }}
        </span>
      </button>
    </div>

    <div v-show="isOpen" class="flex flex-col flex-1 min-h-0">
      <!-- Online Users -->
      <div class="flex-shrink-0 p-3 border-b bg-gray-50/80 backdrop-blur-sm">
        <div class="flex items-center">
          <div
            class="flex -space-x-2 hover:space-x-1 transition-all duration-200"
          >
            <div
              v-for="user in onlineUsers"
              :key="user.email"
              class="relative group"
            >
              <div
                class="relative transform hover:scale-105 transition-all duration-200"
              >
                <img
                  v-if="user.avatar_url"
                  :src="user.avatar_url"
                  :alt="user.name"
                  class="w-9 h-9 rounded-full bg-indigo-100 object-cover ring-2 ring-white shadow-sm"
                />
                <span
                  v-else
                  class="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-600 flex items-center justify-center text-sm font-medium ring-2 ring-white shadow-sm"
                >
                  {{ user.name[0].toUpperCase() }}
                </span>
                <span
                  class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full ring-2 ring-emerald-400/20"
                ></span>
              </div>
              <!-- Tooltip -->
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                {{ user.name }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages Container -->
      <div
        class="flex-1 overflow-y-auto min-h-0 bg-gradient-to-b from-gray-50/50 to-white relative scroll-smooth"
      >
        <div ref="messagesContainer" class="p-4 space-y-4 pb-16">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex gap-3 group"
            :class="{
              'justify-end': message.sender_email === currentUserEmail,
            }"
          >
            <!-- Avatar pro ostatní uživatele -->
            <template v-if="message.sender_email !== currentUserEmail">
              <div
                class="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity"
              >
                <div
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shadow-sm"
                >
                  <span
                    class="text-sm font-medium bg-gradient-to-br from-indigo-600 to-violet-600 bg-clip-text text-transparent"
                  >
                    {{ message.sender_name[0].toUpperCase() }}
                  </span>
                </div>
              </div>
            </template>

            <!-- Message content -->
            <div
              class="max-w-[70%] rounded-2xl px-4 py-2 shadow-sm"
              :class="{
                'bg-gradient-to-br from-indigo-600 to-violet-600 text-white':
                  message.sender_email === currentUserEmail,
                'bg-white border border-gray-100':
                  message.sender_email !== currentUserEmail,
              }"
            >
              <div
                v-if="message.sender_email !== currentUserEmail"
                class="text-xs font-medium mb-1"
                :class="{
                  'text-gray-500': message.sender_email !== currentUserEmail,
                }"
              >
                {{ message.sender_name }}
              </div>
              <p class="text-sm">{{ message.message }}</p>
              <div
                class="text-[11px] mt-1 opacity-80"
                :class="{
                  'text-white/70': message.sender_email === currentUserEmail,
                  'text-gray-400': message.sender_email !== currentUserEmail,
                }"
              >
                {{ formatTime(message.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Indikátor psaní - mezi zprávami a inputem -->
        <div
          v-if="someoneElseIsTyping"
          class="flex-shrink-0 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 shadow-[0_-1px_3px_rgba(0,0,0,0.1)] backdrop-blur-sm"
        >
          <div class="typing-indicator">
            <span class="bg-indigo-400"></span>
            <span class="bg-indigo-400"></span>
            <span class="bg-indigo-400"></span>
          </div>
          <span class="text-xs text-indigo-600 font-medium"
            >{{ typingUserName }} píše...</span
          >
        </div>
      </div>

      <!-- Input - vždy na spodku -->
      <div class="flex-shrink-0 p-3 border-t bg-white relative z-10">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <div class="relative flex-1">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Napište zprávu..."
              class="w-full px-4 py-2.5 pr-20 border border-gray-200 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
              :disabled="loading"
              @input="handleTyping"
            />
            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2"
            >
              <div v-if="loading">
                <div
                  class="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"
                ></div>
              </div>
              <button
                type="button"
                class="emoji-button p-1.5 text-gray-400 hover:text-indigo-500 focus:outline-none transition-colors"
                @click.stop="showEmojiPicker = !showEmojiPicker"
              >
                <span class="material-icons-outlined text-[20px]">mood</span>
              </button>
            </div>

            <!-- Emoji Picker -->
            <div
              v-if="showEmojiPicker"
              class="absolute bottom-full right-0 mb-2"
            >
              <emoji-picker
                class="light"
                @emoji-click="onEmojiSelect"
              ></emoji-picker>
            </div>
          </div>
          <button
            type="submit"
            class="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-lg hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
            :disabled="!newMessage.trim() || loading"
          >
            <span class="material-icons-outlined">send</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from "vue";
import { useAdminChat } from "~/composables/useAdminChat";
import { useSupabaseClient } from "#imports";
import type { ChatMessage, ChatUser } from "~/composables/useAdminChat";
import "emoji-picker-element";

const supabase = useSupabaseClient();
const isOpen = ref(false);
const newMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const currentUserEmail = ref<string | null>(null);
const showEmojiPicker = ref(false);
let typingTimeout: NodeJS.Timeout | null = null;

const {
  messages,
  users: onlineUsers,
  loading,
  sendMessage: sendChatMessage,
  typingUsers,
  signalTyping,
} = useAdminChat();

// Computed pro zobrazení indikátoru psaní
const someoneElseIsTyping = computed(() => {
  return typingUsers.value.some((email) => email !== currentUserEmail.value);
});

// Jméno uživatele, který píše
const typingUserName = computed(() => {
  const typingUser = onlineUsers.value.find(
    (user) =>
      typingUsers.value.includes(user.email) &&
      user.email !== currentUserEmail.value
  );
  return typingUser?.name || "Někdo";
});

// Sledování nových zpráv pro automatické scrollování
watch(
  [messages, typingUsers],
  () => {
    if (!isOpen.value) return;

    nextTick(() => {
      scrollToBottom(true);
    });
  },
  { deep: true }
);

// Get current user
onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    currentUserEmail.value = user.email;

    // Kontrola a aktualizace jména uživatele pokud chybí
    if (!user.user_metadata?.name) {
      const { data: userRole } = await supabase
        .from("user_roles")
        .select("name")
        .eq("email", user.email)
        .single();

      if (userRole?.name) {
        await supabase.auth.updateUser({
          data: { name: userRole.name },
        });
      }
    }
  }
});

const toggleChat = () => {
  isOpen.value = !isOpen.value;

  // Pokud otevíráme chat, scrollujeme na konec
  if (isOpen.value) {
    // Počkáme 1 sekundu před scrollem
    setTimeout(() => {
      const container = messagesContainer.value?.parentElement;
      if (container) {
        // Nastavíme smooth scroll
        container.style.scrollBehavior = "smooth";
        container.scrollTop = container.scrollHeight;

        // Po dokončení scrollu vrátíme původní chování
        setTimeout(() => {
          container.style.scrollBehavior = "auto";
        }, 1000);
      }
    }, 1000);
  }
};

// Vylepšená funkce pro scroll
const scrollToBottom = (force = false) => {
  const container = messagesContainer.value?.parentElement;
  if (!container) return;

  const isScrolledNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 100;

  if (force || isScrolledNearBottom) {
    // Pro nové zprávy použijeme auto scroll
    container.style.scrollBehavior = "auto";
    container.scrollTop = container.scrollHeight;
  }
};

const handleScroll = () => {
  // TODO: Implementovat načítání starších zpráv při scrollování nahoru
};

const handleTyping = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  // Signalizujeme ostatním, že píšeme
  signalTyping(true);

  // Zrušíme signál po 2 sekundách nečinnosti
  typingTimeout = setTimeout(() => {
    signalTyping(false);
  }, 2000);
};

// Cleanup při unmount
onUnmounted(() => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }
  signalTyping(false);
});

const sendMessage = async () => {
  if (!newMessage.value.trim() || loading.value) return;

  const messageText = newMessage.value;
  newMessage.value = ""; // Okamžitě vyčistíme input

  try {
    await sendChatMessage(messageText);
    scrollToBottom(true);
  } catch (error) {
    console.error("Nepodařilo se odeslat zprávu:", error);
    newMessage.value = messageText; // Vrátíme zprávu zpět do inputu v případě chyby
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("cs-CZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return (
      "Včera " +
      date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
    );
  } else {
    return (
      date.toLocaleDateString("cs-CZ", { day: "2-digit", month: "2-digit" }) +
      " " +
      date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })
    );
  }
};

// Funkce pro vložení emoji
const onEmojiSelect = (event: CustomEvent) => {
  const emoji = event.detail.unicode;
  const input = document.querySelector(
    'input[type="text"]'
  ) as HTMLInputElement;
  const startPos = input.selectionStart || 0;
  const endPos = input.selectionEnd || 0;

  newMessage.value =
    newMessage.value.substring(0, startPos) +
    emoji +
    newMessage.value.substring(endPos);

  // Nastavíme kurzor za vložené emoji
  nextTick(() => {
    input.selectionStart = startPos + emoji.length;
    input.selectionEnd = startPos + emoji.length;
    input.focus();
  });

  showEmojiPicker.value = false;
};

// Zavření emoji pickeru při kliknutí mimo
const closeEmojiPicker = (event: MouseEvent) => {
  const picker = document.querySelector("emoji-picker");
  const button = document.querySelector(".emoji-button");

  if (
    picker &&
    button &&
    !picker.contains(event.target as Node) &&
    !button.contains(event.target as Node)
  ) {
    showEmojiPicker.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeEmojiPicker);
});

onUnmounted(() => {
  document.removeEventListener("click", closeEmojiPicker);
});
</script>

<style scoped>
.material-icons-outlined {
  font-size: 20px;
  line-height: 1;
}

.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.typing-indicator span {
  width: 3px;
  height: 3px;
  background-color: #9ca3af;
  border-radius: 50%;
  animation: typing 1s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(-2px);
    opacity: 1;
  }
}

/* Scrollbar styling */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(107, 114, 128, 0.3) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(107, 114, 128, 0.3);
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.5);
}

emoji-picker {
  --num-columns: 8;
  width: 320px;
  height: 400px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Světlý motiv pro picker */
emoji-picker.light {
  --background: #ffffff;
  --border-color: #e5e7eb;
  --indicator-color: #6366f1;
  --input-border-color: #e5e7eb;
  --input-font-color: #374151;
  --input-placeholder-color: #9ca3af;
  --outline-color: #6366f1;
}
</style>