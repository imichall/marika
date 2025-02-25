import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useSupabaseClient } from '#imports'
import { useToast } from 'vue-toastification'

export interface ChatMessage {
  id: string
  sender_email: string
  sender_name: string
  message: string
  created_at: string
  read_by?: string[]
  mentions?: string[]
}

export interface ChatUser {
  email: string
  name: string
  avatar_url?: string
  last_seen: string
  is_online: boolean
  is_typing?: boolean
}

// Typy pro Supabase
interface PresenceState {
  email: string;
  timestamp: string;
}

interface BroadcastPayload {
  type: string;
  event: string;
  payload?: {
    message?: ChatMessage;
  };
}

export const useAdminChat = () => {
  const supabase = useSupabaseClient()
  const toast = useToast()
  const messages = ref<ChatMessage[]>([])
  const users = ref<ChatUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const typingUsers = ref<string[]>([])
  const unreadCount = ref(0)
  const mentionsCount = ref(0)
  const lastReadTimestamp = ref<string | null>(null)
  const currentUser = ref<any>(null)
  let subscription: any = null
  let typingTimeout: NodeJS.Timeout | null = null
  let broadcastChannel: any = null
  const isOpen = ref(false)
  const messagesContainer = ref<HTMLElement | null>(null)

  // Přidáme nové stavové proměnné
  const PAGE_SIZE = 10;
  const hasMoreMessages = ref(true);
  const isLoadingMore = ref(false);

  // Funkce pro získání aktuálního uživatele
  const getCurrentUser = async () => {
    if (currentUser.value) return currentUser.value;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      currentUser.value = user;
    }
    return currentUser.value;
  };

  // Nastavení broadcast channelu pro nové zprávy
  const setupBroadcastChannel = () => {
    broadcastChannel = supabase.channel('chat-updates')
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {

        }
      })
  }

  // Upravená funkce pro načítání zpráv
  const fetchMessages = async (loadMore = false) => {
    try {
      if (!loadMore) {
        loading.value = true;
        // Reset stavu při prvním načtení
        messages.value = [];
        hasMoreMessages.value = true;
      } else {
        isLoadingMore.value = true;
      }

      const user = await getCurrentUser();
      if (!user?.email) throw new Error('Uživatel není přihlášen');

      // Načteme poslední čas přečtení
      const { data: lastRead } = await supabase
        .from('admin_chat_last_read')
        .select('last_read_at')
        .eq('user_email', user.email)
        .single();

      // Určíme offset pro stránkování
      const offset = loadMore ? messages.value.length : 0;

      // Načteme pouze další stránku zpráv
      const { data, error: err } = await supabase
        .from('admin_chat_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (err) throw err;

      if (!data || data.length === 0) {
        hasMoreMessages.value = false;
        return;
      }

      // Přidáme zprávy do seznamu
      if (loadMore) {
        messages.value = [...data.reverse(), ...messages.value];
      } else {
        messages.value = data.reverse();
      }

      // Zkontrolujeme, jestli existují další zprávy
      hasMoreMessages.value = data.length === PAGE_SIZE;

      // Nastavíme lastReadTimestamp a spočítáme nepřečtené
      if (lastRead?.last_read_at) {
        lastReadTimestamp.value = lastRead.last_read_at;
        const unreadMessages = messages.value.filter(
          msg => new Date(msg.created_at) > new Date(lastRead.last_read_at) &&
                msg.sender_email !== user.email
        );
        unreadCount.value = unreadMessages.length;
      } else {
        // Pokud nemáme záznam o posledním přečtení, vytvoříme ho s časem poslední zprávy
        const latestMessage = messages.value[messages.value.length - 1];
        if (latestMessage) {
          const timestamp = new Date(latestMessage.created_at).toISOString();
          await supabase
            .from('admin_chat_last_read')
            .upsert({
              user_email: user.email,
              last_read_at: timestamp
            });

          lastReadTimestamp.value = timestamp;
          unreadCount.value = 0;
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      error.value = err instanceof Error ? err.message : 'Nepodařilo se načíst zprávy';
    } finally {
      loading.value = false;
      isLoadingMore.value = false;
    }
  };

  // Aktualizace počtu nepřečtených zpráv
  const updateUnreadCount = async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) return

      // Načteme poslední čas přečtení
      const { data: lastRead } = await supabase
        .from('admin_chat_last_read')
        .select('last_read_at')
        .eq('user_email', user.email)
        .single()

      if (lastRead?.last_read_at) {
        lastReadTimestamp.value = lastRead.last_read_at
        // Spočítáme zprávy novější než poslední přečtení, ale ne od aktuálního uživatele
        const unreadMessages = messages.value.filter(
          msg => new Date(msg.created_at) > new Date(lastReadTimestamp.value!) &&
                msg.sender_email !== user.email
        )
        unreadCount.value = unreadMessages.length
      } else {
        // Pokud nemáme záznam o posledním přečtení, vytvoříme ho s aktuálním časem
        const { data: newLastRead, error: insertError } = await supabase
          .from('admin_chat_last_read')
          .upsert({
            user_email: user.email,
            last_read_at: new Date().toISOString()
          })
          .select('last_read_at')
          .single()

        if (!insertError && newLastRead) {
          lastReadTimestamp.value = newLastRead.last_read_at
          // Počítáme pouze zprávy od ostatních uživatelů
          const unreadMessages = messages.value.filter(
            msg => msg.sender_email !== user.email
          )
          unreadCount.value = unreadMessages.length
        } else {
          console.error('Error creating last read record:', insertError)
          // Počítáme pouze zprávy od ostatních uživatelů
          const unreadMessages = messages.value.filter(
            msg => msg.sender_email !== user.email
          )
          unreadCount.value = unreadMessages.length
          lastReadTimestamp.value = null
        }
      }
    } catch (err) {
      console.error('Error updating unread count:', err)
    }
  }

  // Označení konkrétní zprávy jako přečtené
  const markMessageAsRead = async (messageTimestamp: string) => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) return;

      // Aktualizujeme čas posledního přečtení pouze pokud je zpráva novější
      if (!lastReadTimestamp.value || new Date(messageTimestamp) > new Date(lastReadTimestamp.value)) {
        await supabase
          .from('admin_chat_last_read')
          .upsert({
            user_email: user.email,
            last_read_at: messageTimestamp
          });

        lastReadTimestamp.value = messageTimestamp;

        // Přepočítáme počet nepřečtených zpráv
        const unreadMessages = messages.value.filter(
          msg => new Date(msg.created_at) > new Date(messageTimestamp)
        );
        unreadCount.value = unreadMessages.length;
      }
    } catch (err) {
      console.error('Error marking message as read:', err);
    }
  };

  // Označení všech zpráv jako přečtené
  const markAllAsRead = async () => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) return;

      // Najdeme nejnovější zprávu
      const latestMessage = messages.value[messages.value.length - 1];
      if (!latestMessage) return;

      await markMessageAsRead(latestMessage.created_at);
    } catch (err) {
      console.error('Error marking all messages as read:', err);
    }
  };

  // Nastavení real-time subscriptions
  const setupSubscriptions = async () => {
    if (subscription) {
      subscription.unsubscribe();
    }

    const user = await getCurrentUser();
    if (!user?.email) return;

    // Vytvoříme jeden kanál pro všechny události
    subscription = supabase
      .channel('admin-chat')
      .on(
        'broadcast',
        { event: 'new_message' },
        async (payload: BroadcastPayload) => {
          const user = await getCurrentUser();
          if (!user?.email) return;

          const { data: lastRead } = await supabase
            .from('admin_chat_last_read')
            .select('last_read_at')
            .eq('user_email', user.email)
            .single();

          // Pokud máme data zprávy v payloadu, použijeme je přímo
          if (payload.payload?.message) {
            const newMessage = payload.payload.message
            // Přidáme zprávu do seznamu, pokud tam ještě není
            if (!messages.value.some(m => m.id === newMessage.id)) {
              messages.value = [...messages.value, newMessage]

              // Zvýšíme počet nepřečtených pouze pokud zpráva není od aktuálního uživatele
              if (newMessage.sender_email !== user.email) {
                // Pokud máme poslední čas přečtení a nová zpráva je novější,
                // zvýšíme počet nepřečtených zpráv
                if (lastRead?.last_read_at) {
                  if (new Date(newMessage.created_at) > new Date(lastRead.last_read_at)) {
                    unreadCount.value++
                    // Pokud je uživatel zmíněn v nové zprávě, zvýšíme počet mentions
                    if (newMessage.mentions?.includes(user.email)) {
                      mentionsCount.value++
                    }
                  }
                } else {
                  // Pokud nemáme záznam o posledním přečtení, vytvoříme ho s časem před novou zprávou
                  const timestamp = new Date(newMessage.created_at)
                  timestamp.setSeconds(timestamp.getSeconds() - 1)

                  await supabase
                    .from('admin_chat_last_read')
                    .upsert({
                      user_email: user.email,
                      last_read_at: timestamp.toISOString()
                    })

                  lastReadTimestamp.value = timestamp.toISOString()
                  unreadCount.value = 1
                  // Pokud je uživatel zmíněn, nastavíme počet mentions
                  if (newMessage.mentions?.includes(user.email)) {
                    mentionsCount.value = 1
                  }
                }
              }
            }
          } else {
            // Fallback na původní chování - načteme všechny zprávy
            const { data, error: err } = await supabase
              .from('admin_chat_messages')
              .select('*')
              .order('created_at', { ascending: true })
              .limit(50)

            if (err) {
              console.error('Error fetching messages:', err)
              return
            }

            messages.value = data || []

            // Spočítáme nepřečtené zprávy podle posledního času přečtení
            if (lastRead?.last_read_at) {
              lastReadTimestamp.value = lastRead.last_read_at
              const unreadMessages = messages.value.filter(
                msg => new Date(msg.created_at) > new Date(lastReadTimestamp.value!) &&
                      msg.sender_email !== user.email
              )
              unreadCount.value = unreadMessages.length

              // Spočítáme nepřečtené mentions
              const mentionedMessages = messages.value.filter(
                msg => new Date(msg.created_at) > new Date(lastReadTimestamp.value!) &&
                      msg.mentions?.includes(user.email)
              )
              mentionsCount.value = mentionedMessages.length
            } else {
              // Pokud nemáme záznam o posledním přečtení, vytvoříme ho s časem před nejnovější zprávou
              const latestMessage = messages.value[messages.value.length - 1]
              if (latestMessage) {
                const timestamp = new Date(latestMessage.created_at)
                timestamp.setSeconds(timestamp.getSeconds() - 1)

                await supabase
                  .from('admin_chat_last_read')
                  .upsert({
                    user_email: user.email,
                    last_read_at: timestamp.toISOString()
                  })

                lastReadTimestamp.value = timestamp.toISOString()
                // Počítáme pouze zprávy od ostatních uživatelů
                const unreadMessages = messages.value.filter(
                  msg => msg.sender_email !== user.email
                )
                unreadCount.value = unreadMessages.length

                // Počítáme mentions
                const mentionedMessages = messages.value.filter(
                  msg => msg.mentions?.includes(user.email)
                )
                mentionsCount.value = mentionedMessages.length
              }
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'chat_archived' },
        () => {
          // Vyčistíme všechny zprávy a resetujeme stav
          messages.value = []
          unreadCount.value = 0
          lastReadTimestamp.value = null
          // Zobrazíme informaci uživateli
          toast.info('Chat byl archivován administrátorem')
        }
      )
      .on(
        'presence',
        { event: 'sync' },
        () => {
          const presenceState = subscription.presenceState()
          const typing = Object.values(presenceState)
            .flat()
            .map((user: any) => user.email)
            .filter(Boolean)

          typingUsers.value = typing
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_users'
        },
        async () => {

          await fetchOnlineUsers()
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {

        }
      })
  }

  // Funkce pro extrakci mentions ze zprávy
  const extractMentions = async (message: string): Promise<string[]> => {
    const mentionRegex = /@([^\s]+)/g;
    const matches = message.match(mentionRegex) || [];
    const mentions: string[] = [];

    for (const match of matches) {
      const username = match.slice(1); // odstraníme @
      // Najdeme uživatele podle jména
      const { data } = await supabase
        .from('chat_users')
        .select('email')
        .ilike('name', username)
        .single();

      if (data?.email) {
        mentions.push(data.email);
      }
    }

    return [...new Set(mentions)]; // odstranění duplicit
  };

  // Odeslání nové zprávy
  const sendMessage = async (message: string) => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) throw new Error('Uživatel není přihlášen');

      // Získáme jméno uživatele z user_roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('name')
        .eq('email', user.email)
        .single();

      if (!userRole?.name) {
        throw new Error('Uživatel nemá nastavené jméno');
      }

      // Vytvoříme novou zprávu s předběžným ID
      const tempMessage: ChatMessage = {
        id: crypto.randomUUID(),
        sender_email: user.email,
        sender_name: userRole.name,
        message,
        created_at: new Date().toISOString()
      }

      // Přidáme zprávu lokálně pro okamžitou odezvu
      messages.value = [...messages.value, tempMessage]

      // Odešleme zprávu do databáze
      const { data, error: err } = await supabase
        .from('admin_chat_messages')
        .insert([{
          sender_email: user.email,
          sender_name: userRole.name,
          message
        }])
        .select()
        .single()

      if (err) {
        // V případě chyby odstraníme dočasnou zprávu
        messages.value = messages.value.filter(m => m.id !== tempMessage.id)
        throw err
      }

      // Nahradíme dočasnou zprávu skutečnou
      if (data) {
        messages.value = messages.value.map(m =>
          m.id === tempMessage.id ? data : m
        )

        // Aktualizujeme čas posledního přečtení pro odesílatele
        await supabase
          .from('admin_chat_last_read')
          .upsert({
            user_email: user.email,
            last_read_at: data.created_at
          })

        lastReadTimestamp.value = data.created_at
        // Přepočítáme nepřečtené zprávy (neměly by být žádné od nás)
        const unreadMessages = messages.value.filter(
          msg => new Date(msg.created_at) > new Date(lastReadTimestamp.value!) &&
                msg.sender_email !== user.email
        )
        unreadCount.value = unreadMessages.length

        // Odešleme broadcast všem připojeným klientům s kompletními daty zprávy
        await subscription.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message: data }
        })
      }

      // Signalizujeme ostatním, že jsme přestali psát
      await signalTyping(false)

      return data
    } catch (err) {
      console.error('Error sending message:', err)
      throw err
    }
  }

  // Funkce pro získání návrhů uživatelů pro mentions
  const getUserSuggestions = async (query: string): Promise<ChatUser[]> => {
    if (!query) return [];

    const { data } = await supabase
      .from('chat_users')
      .select('email, name')
      .ilike('name', `${query}%`)
      .limit(5);

    return data || [];
  };

  // Načtení online uživatelů
  const fetchOnlineUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_users')
        .select('email, name')
        .order('name');

      if (error) throw error;

      const newUsers = (data || []).map((user: ChatUser) => ({
        email: user.email,
        name: user.name || user.email,
        avatar_url: null,
        last_seen: new Date().toISOString(),
        is_online: true,
        is_typing: false
      }));

      // Vždy aktualizujeme seznam uživatelů
      users.value = newUsers;
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  };

  // Aktualizace stavu uživatele
  const updateUserStatus = async (isOnline: boolean) => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) return;

      // Nejprve zkontrolujeme, zda má uživatel přístup k chatu
      const { data: chatUser } = await supabase
        .from('chat_users')
        .select('email')
        .eq('email', user.email)
        .single();

      if (!chatUser) return;

      // Aktualizujeme stav pouze pro uživatele s přístupem
      await supabase
        .from('admin_chat_users')
        .upsert({
          email: user.email,
          name: user.user_metadata?.name || user.email,
          last_seen: new Date().toISOString(),
          is_online: isOnline
        });
    } catch (err) {
      console.error('Error updating user status:', err);
    }
  };

  // Signalizace psaní
  const signalTyping = async (isTyping: boolean) => {
    try {
      const user = await getCurrentUser();
      if (!user?.email) return;

      if (isTyping) {
        await subscription?.track({
          email: user.email,
          timestamp: new Date().toISOString()
        });
      } else {
        await subscription?.untrack();
      }
    } catch (err) {
      console.error('Error signaling typing:', err);
    }
  };

  // Cleanup
  const cleanup = () => {
    if (subscription) {
      try {
        subscription.untrack();
        subscription.unsubscribe();
      } catch (err) {
        console.error('Error during subscription cleanup:', err);
      }
      subscription = null;
    }
    if (broadcastChannel) {
      try {
        broadcastChannel.unsubscribe();
      } catch (err) {
        console.error('Error during broadcast channel cleanup:', err);
      }
      broadcastChannel = null;
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    updateUserStatus(false);
  };

  const saveScrollPosition = () => {
    const container = messagesContainer.value?.parentElement;
    if (!container) return;

    sessionStorage.setItem('chat-scroll-position', container.scrollTop.toString());
  };

  const restoreScrollPosition = () => {
    const container = messagesContainer.value?.parentElement;
    if (!container) return;

    const savedPosition = sessionStorage.getItem('chat-scroll-position');
    if (savedPosition) {
      nextTick(() => {
        container.scrollTop = parseInt(savedPosition);
      });
    } else {
      // Pokud nemáme uloženou pozici, scrollujeme na konec
      container.scrollTop = container.scrollHeight;
    }
  };

  const toggleChat = () => {
    if (isOpen.value) {
      // Při zavření chatu uložíme pozici scrollu
      saveScrollPosition();
      cleanup();
    }

    isOpen.value = !isOpen.value;

    // Pokud otevíráme chat
    if (isOpen.value) {
      nextTick(async () => {
        // Nejdřív nastavíme subscriptions
        await setupSubscriptions();

        // Načteme první stránku zpráv
        await fetchMessages();

        // Načteme uživatele pouze jednou při otevření chatu
        await fetchOnlineUsers();

        // Počkáme na další tick, aby se zprávy vykreslily
        nextTick(() => {
          // Obnovíme pozici scrollu
          restoreScrollPosition();
        });
      });
    }
  };

  onMounted(async () => {
    try {
      // Načteme uživatele hned na začátku
      await getCurrentUser();

      await Promise.all([
        fetchMessages(),
        fetchOnlineUsers(),
        updateUserStatus(true)
      ]);

      setupBroadcastChannel();
      setupSubscriptions();

      // Aktualizace stavu uživatele každých 30 sekund
      const interval = setInterval(() => {
        updateUserStatus(true);
      }, 30000);

      onUnmounted(() => {
        cleanup();
        clearInterval(interval);
        // Uložíme pozici scrollu při unmount
        saveScrollPosition();
        // Vyčistíme uživatelská data
        currentUser.value = null;
      });
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  });

  return {
    messages,
    users,
    loading,
    error,
    typingUsers,
    unreadCount,
    mentionsCount,
    lastReadTimestamp,
    sendMessage,
    fetchMessages,
    fetchOnlineUsers,
    signalTyping,
    markMessageAsRead,
    markAllAsRead,
    toggleChat,
    isOpen,
    messagesContainer,
    getUserSuggestions,
    hasMoreMessages,
    isLoadingMore,
    PAGE_SIZE
  }
}