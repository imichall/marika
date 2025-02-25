<template>
  <div
    class="fixed bottom-2 z-40 flex flex-col bg-white rounded-lg shadow-xl transition-all duration-300 ease-in-out transform"
    :class="{
      'h-[32rem]': isOpen,
      'h-12': !isOpen,
      'right-4 w-96': !isMobile,
      'left-4 right-4 max-w-lg mx-auto': isMobile,
    }"
  >
    <!-- Header -->
    <div
      class="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-lg cursor-pointer shadow-lg"
      @click="toggleChat"
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <span class="material-icons-outlined text-xl">chat</span>
          <!-- Indikátor nepřečtených zpráv -->
          <span
            v-if="unreadCount > 0"
            class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] font-medium flex items-center justify-center rounded-full ring-2 ring-white"
          >
            {{ unreadCount }}
          </span>
        </div>
        <h3 class="font-semibold">Admin Chat</h3>
        <div class="flex items-center gap-2">
          <span
            v-if="onlineUsersCount > 0"
            class="px-2.5 py-1 text-xs bg-white/20 backdrop-blur-sm rounded-full font-medium"
          >
            {{ onlineUsersCount }} online
          </span>
          <span
            v-if="mentionsCount > 0"
            class="px-2.5 py-1 text-xs bg-red-500 text-white rounded-full font-medium flex items-center gap-1"
          >
            <span class="material-icons-outlined text-sm">alternate_email</span>
            {{ mentionsCount }}
          </span>
        </div>
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
        @scroll="handleScroll"
      >
        <!-- Loading indikátor pro načítání starších zpráv -->
        <div v-if="isLoadingMore" class="flex justify-center py-4">
          <div
            class="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"
          ></div>
        </div>

        <div ref="messagesContainer" class="p-4 space-y-4 pb-16">
          <div
            v-for="(message, index) in messages"
            :key="message.id"
            class="space-y-4"
          >
            <!-- Časový oddělovač -->
            <div
              v-if="shouldShowDateDivider(message, messages[index - 1])"
              class="relative py-3"
            >
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-200"></div>
              </div>
              <div class="relative flex justify-center">
                <span
                  class="px-4 py-1.5 text-xs font-medium text-gray-500 bg-white rounded-full border border-gray-200"
                >
                  {{ formatDateDivider(message.created_at) }}
                </span>
              </div>
            </div>

            <!-- Divider pro nepřečtené zprávy -->
            <div
              v-if="shouldShowUnreadDivider(message, index)"
              class="relative py-3"
            >
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t-2 border-indigo-300"></div>
              </div>
              <div class="relative flex justify-center">
                <span
                  class="px-4 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full border border-indigo-200 shadow-sm ring-4 ring-white"
                >
                  Nové
                </span>
              </div>
            </div>

            <!-- Message -->
            <div
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
                class="message-content max-w-[70%] rounded-2xl px-4 py-2 shadow-sm"
                :data-timestamp="message.created_at"
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
                <p
                  class="text-sm"
                  v-html="
                    formatMessageWithMentions(
                      message.message,
                      message.sender_email === currentUserEmail
                    )
                  "
                ></p>
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
              class="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-full focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
              :disabled="loading"
              @input="handleTyping"
              @keydown="handleKeydown"
            />

            <!-- User suggestions -->
            <div
              v-if="showSuggestions && userSuggestions.length > 0"
              class="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 max-h-48 overflow-y-auto"
            >
              <div
                v-for="user in userSuggestions"
                :key="user.email"
                class="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex items-center gap-2"
                @click="selectUser(user)"
              >
                <div
                  class="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-xs font-medium"
                >
                  {{ user.name[0].toUpperCase() }}
                </div>
                <span class="text-sm">{{ user.name }}</span>
              </div>
            </div>

            <div
              class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center"
            >
              <div v-if="loading">
                <div
                  class="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent"
                ></div>
              </div>
              <button
                type="button"
                class="emoji-button p-2 text-gray-400 hover:text-indigo-500 focus:outline-none transition-colors"
                @click.stop="showEmojiPicker = !showEmojiPicker"
              >
                <span class="material-icons-outlined text-xl">mood</span>
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
            class="p-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full hover:shadow-lg hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200 w-10 h-10 flex items-center justify-center"
            :disabled="!newMessage.trim() || loading"
          >
            <span class="material-icons-outlined text-xl">send</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  nextTick,
  watch,
  onUnmounted,
} from "#imports";
import { useAdminChat } from "~/composables/useAdminChat";
import { useSupabaseClient } from "#imports";
import "emoji-picker-element";

const supabase = useSupabaseClient();
const newMessage = ref("");
const messagesContainer = ref<HTMLElement | null>(null);
const currentUserEmail = ref<string | null>(null);
const currentUserName = ref<string | null>(null);
const showEmojiPicker = ref(false);
const showSuggestions = ref(false);
const userSuggestions = ref<ChatUser[]>([]);
let typingTimeout: NodeJS.Timeout | null = null;
let currentMentionStart = -1;

const {
  messages,
  users: onlineUsers,
  loading,
  sendMessage: sendChatMessage,
  typingUsers,
  signalTyping,
  unreadCount,
  mentionsCount,
  lastReadTimestamp,
  markMessageAsRead,
  markAllAsRead,
  toggleChat,
  isOpen,
  getUserSuggestions,
  hasMoreMessages,
  isLoadingMore,
  PAGE_SIZE,
  fetchMessages,
} = useAdminChat();

const onlineUsersCount = computed(() => onlineUsers.value.length);

// Computed pro zobrazení indikátoru psaní
const someoneElseIsTyping = computed(() => {
  return typingUsers.value.some(
    (email: string) => email !== currentUserEmail.value
  );
});

// Jméno uživatele, který píše
const typingUserName = computed(() => {
  const typingUser = onlineUsers.value.find(
    (user: ChatUser) =>
      typingUsers.value.includes(user.email) &&
      user.email !== currentUserEmail.value
  );
  return typingUser?.name || "Někdo";
});

// Sledování nových zpráv pro automatické scrollování
watch(
  messages,
  (newMessages: ChatMessage[], oldMessages: ChatMessage[]) => {
    if (!isOpen.value) return;

    // Pokud je nových zpráv více než starých, znamená to že byly načteny starší zprávy
    // V takovém případě nechceme scrollovat
    if (newMessages.length > oldMessages.length && oldMessages.length > 0)
      return;

    // Scrollujeme pouze pokud přišla nová zpráva
    if (newMessages.length === oldMessages.length + 1) {
      nextTick(() => {
        const container = messagesContainer.value?.parentElement;
        if (!container) return;

        const isScrolledNearBottom =
          container.scrollHeight -
            container.scrollTop -
            container.clientHeight <
          100;

        // Scrollujeme pouze pokud jsme byli u konce chatu
        if (isScrolledNearBottom) {
          scrollToBottom(true);
        }
      });
    }
  },
  { deep: true }
);

// Přidáme watch pro isOpen, který obnoví pozici scrollu
watch(isOpen, async (newValue) => {
  if (newValue) {
    // Počkáme na načtení zpráv
    await fetchMessages();

    // Obnovíme pozici scrollu po načtení zpráv
    nextTick(() => {
      const container = messagesContainer.value?.parentElement;
      if (!container) return;

      const savedPosition = sessionStorage.getItem("chat-scroll-position");
      if (savedPosition) {
        container.scrollTop = parseInt(savedPosition);
      } else {
        // Pokud nemáme uloženou pozici, scrollujeme na konec
        container.scrollTop = container.scrollHeight;
      }
    });
  }
});

// Get current user
onMounted(async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    currentUserEmail.value = user.email;
    currentUserName.value = user.user_metadata?.name;
  }
});

// Přidáme typy pro zprávy a uživatele
interface ChatMessage {
  id: string;
  sender_email: string;
  sender_name: string;
  message: string;
  created_at: string;
  mentions?: string[];
}

interface ChatUser {
  email: string;
  name: string;
  avatar_url?: string;
  last_seen: string;
  is_online: boolean;
  is_typing?: boolean;
}

// Upravíme funkci pro kontrolu viditelnosti zprávy
const isMessageVisible = (element: Element): boolean => {
  const container = messagesContainer.value?.parentElement;
  if (!container) return false;

  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  return (
    elementRect.top >= containerRect.top &&
    elementRect.bottom <= containerRect.bottom
  );
};

// Vylepšená funkce pro scroll
const scrollToBottom = (force = false) => {
  const container = messagesContainer.value?.parentElement;
  if (!container) return;

  const isScrolledNearBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight < 100;

  if (force || isScrolledNearBottom) {
    nextTick(() => {
      container.scrollTop = container.scrollHeight;
      // Pokud scrollujeme na konec, označíme všechny zprávy jako přečtené
      markAllAsRead();
    });
  }
};

// Upravená funkce pro scroll
const handleScroll = async () => {
  const container = messagesContainer.value?.parentElement;
  if (!container) return;

  // Uložíme aktuální pozici scrollu
  sessionStorage.setItem(
    "chat-scroll-position",
    container.scrollTop.toString()
  );

  // Kontrola viditelnosti zpráv pro označení jako přečtené
  const messageElements = container.querySelectorAll(".message-content");
  let lastVisibleMessageTime = null;

  messageElements.forEach((element: Element) => {
    if (isMessageVisible(element)) {
      const timestamp = element.getAttribute("data-timestamp");
      if (timestamp) {
        lastVisibleMessageTime = timestamp;
      }
    }
  });

  if (lastVisibleMessageTime) {
    markMessageAsRead(lastVisibleMessageTime);
  }
};

const handleTyping = () => {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
  }

  signalTyping(true);

  typingTimeout = setTimeout(() => {
    signalTyping(false);
  }, 2000);
};

const handleKeydown = async (e: KeyboardEvent) => {
  const input = e.target as HTMLInputElement;
  const cursorPosition = input.selectionStart || 0;

  // Pokud uživatel píše @ a není v prostředku slova
  if (
    e.key === "@" &&
    (cursorPosition === 0 || newMessage.value[cursorPosition - 1] === " ")
  ) {
    currentMentionStart = cursorPosition;
    showSuggestions.value = true;
    userSuggestions.value = await getUserSuggestions("");
  }
  // Pokud uživatel píše po @
  else if (currentMentionStart !== -1 && cursorPosition > currentMentionStart) {
    const query = newMessage.value.slice(
      currentMentionStart + 1,
      cursorPosition
    );
    userSuggestions.value = await getUserSuggestions(query);
  }
  // Zavřeme návrhy při stisknutí mezerníku nebo enteru
  else if (e.key === " " || e.key === "Enter") {
    showSuggestions.value = false;
    currentMentionStart = -1;
  }
};

const selectUser = (user: ChatUser) => {
  if (currentMentionStart === -1) return;

  const beforeMention = newMessage.value.slice(0, currentMentionStart);
  const afterMention = newMessage.value.slice(currentMentionStart);
  const mentionText = `@${user.name}`;

  // Najdeme konec aktuálního slova (mezera nebo konec textu)
  const spaceIndex = afterMention.indexOf(" ");
  const endIndex = spaceIndex === -1 ? afterMention.length : spaceIndex;

  // Nahradíme text od @ po mezeru nebo konec textu jménem uživatele
  newMessage.value = beforeMention + mentionText + afterMention.slice(endIndex);

  // Nastavíme kurzor za vložené jméno
  nextTick(() => {
    const input = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    const newCursorPosition = beforeMention.length + mentionText.length;
    input.selectionStart = newCursorPosition;
    input.selectionEnd = newCursorPosition;
    input.focus();
  });

  showSuggestions.value = false;
  currentMentionStart = -1;
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

const isMobile = ref(false);

// Přidáme detekci mobilního zařízení
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
  document.addEventListener("click", closeEmojiPicker);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkMobile);
  document.removeEventListener("click", closeEmojiPicker);
});

// Funkce pro kontrolu, zda zobrazit časový oddělovač
const shouldShowDateDivider = (
  currentMessage: ChatMessage,
  previousMessage?: ChatMessage
): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.created_at);
  const previousDate = new Date(previousMessage.created_at);

  return (
    currentDate.getDate() !== previousDate.getDate() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getFullYear() !== previousDate.getFullYear()
  );
};

// Funkce pro formátování data pro oddělovač
const formatDateDivider = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Dnes";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Včera";
  } else {
    return date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
};

// Funkce pro zvýraznění mentions ve zprávě
const formatMessageWithMentions = (
  message: string,
  isCurrentUser: boolean
): string => {
  return message.replace(/@([^\s]+)/g, (match: string, username: string) => {
    const mentionedUser = onlineUsers.value.find(
      (user: ChatUser) => user.name.toLowerCase() === username.toLowerCase()
    );

    if (mentionedUser) {
      const styles = isCurrentUser
        ? "display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; background-color: rgba(255, 255, 255, 0.2); color: white; border-radius: 6px; font-weight: 500;"
        : "display: inline-flex; align-items: center; gap: 2px; padding: 2px 6px; background-color: rgb(224, 231, 255); color: rgb(67, 56, 202); border-radius: 6px; font-weight: 500;";

      const iconStyles = isCurrentUser
        ? 'font-family: "Material Icons Outlined"; font-size: 15px; line-height: 1;'
        : 'font-family: "Material Icons Outlined"; font-size: 15px; line-height: 1; color: rgb(79, 70, 229);';

      return `<span style="${styles}"><span style="${iconStyles}">alternate_email</span>${username}</span>`;
    }
    return match;
  });
};

// Upravíme podmínku pro kontrolu lastReadTimestamp
const shouldShowUnreadDivider = (
  message: ChatMessage,
  index: number
): boolean => {
  if (!lastReadTimestamp.value || !unreadCount.value) return false;

  const messageDate = new Date(message.created_at);
  const lastReadDate = new Date(lastReadTimestamp.value);

  return (
    messageDate > lastReadDate &&
    !messages.value
      .slice(0, index)
      .some((m: ChatMessage) => new Date(m.created_at) > lastReadDate) &&
    message.sender_email !== currentUserEmail.value
  );
};
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

/* Přidáme media query pro mobilní zařízení */
@media (max-width: 768px) {
  .max-w-lg {
    max-width: 32rem;
  }
}

/* Vylepšíme animace */
.scale-95 {
  transform: scale(0.95);
}

.scale-100 {
  transform: scale(1);
}

/* Přidáme transition pro všechny transformace */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
</style>