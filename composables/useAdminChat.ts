import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'

export interface ChatMessage {
  id: string
  sender_email: string
  sender_name: string
  message: string
  created_at: string
  read_by?: string[]
}

export interface ChatUser {
  email: string
  name: string
  avatar_url?: string
  last_seen: string
  is_online: boolean
  is_typing?: boolean
}

export const useAdminChat = () => {
  const supabase = useSupabaseClient()
  const messages = ref<ChatMessage[]>([])
  const users = ref<ChatUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const typingUsers = ref<string[]>([])
  const unreadCount = ref(0)
  const lastReadTimestamp = ref<string | null>(null)
  let subscription: any = null
  let typingTimeout: NodeJS.Timeout | null = null
  let broadcastChannel: any = null

  // Nastavení broadcast channelu pro nové zprávy
  const setupBroadcastChannel = () => {
    broadcastChannel = supabase.channel('chat-updates')
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Připojeno k broadcast channelu')
        }
      })
  }

  // Načtení zpráv
  const fetchMessages = async () => {
    try {
      loading.value = true
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Uživatel není přihlášen')

      const { data, error: err } = await supabase
        .from('admin_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50)

      if (err) throw err
      messages.value = data || []

      // Spočítáme nepřečtené zprávy
      updateUnreadCount()
    } catch (err) {
      console.error('Error fetching messages:', err)
      error.value = err instanceof Error ? err.message : 'Nepodařilo se načíst zprávy'
    } finally {
      loading.value = false
    }
  }

  // Aktualizace počtu nepřečtených zpráv
  const updateUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Načteme poslední čas přečtení
      const { data: lastRead } = await supabase
        .from('admin_chat_last_read')
        .select('last_read_at')
        .eq('user_email', user.email)
        .single()

      if (lastRead?.last_read_at) {
        lastReadTimestamp.value = lastRead.last_read_at
        // Spočítáme zprávy novější než poslední přečtení
        const unreadMessages = messages.value.filter(
          msg => new Date(msg.created_at) > new Date(lastReadTimestamp.value!)
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
          unreadCount.value = 0
        } else {
          console.error('Error creating last read record:', insertError)
          unreadCount.value = messages.value.length
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Aktualizujeme čas posledního přečtení pouze pokud je zpráva novější
      if (!lastReadTimestamp.value || new Date(messageTimestamp) > new Date(lastReadTimestamp.value)) {
        await supabase
          .from('admin_chat_last_read')
          .upsert({
            user_email: user.email,
            last_read_at: messageTimestamp
          })

        lastReadTimestamp.value = messageTimestamp

        // Přepočítáme počet nepřečtených zpráv
        const unreadMessages = messages.value.filter(
          msg => new Date(msg.created_at) > new Date(messageTimestamp)
        )
        unreadCount.value = unreadMessages.length
      }
    } catch (err) {
      console.error('Error marking message as read:', err)
    }
  }

  // Označení všech zpráv jako přečtené
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Najdeme nejnovější zprávu
      const latestMessage = messages.value[messages.value.length - 1]
      if (!latestMessage) return

      await markMessageAsRead(latestMessage.created_at)
    } catch (err) {
      console.error('Error marking all messages as read:', err)
    }
  }

  // Nastavení real-time subscriptions
  const setupSubscriptions = () => {
    if (subscription) {
      subscription.unsubscribe()
    }

    subscription = supabase
      .channel('admin-chat')
      .on(
        'broadcast',
        { event: 'new_message' },
        async (payload) => {
          console.log('Přijat signál o nové zprávě', payload)

          // Načteme aktuální stav přečtení
          const { data: { user } } = await supabase.auth.getUser()
          if (!user?.email) return

          const { data: lastRead } = await supabase
            .from('admin_chat_last_read')
            .select('last_read_at')
            .eq('user_email', user.email)
            .single()

          // Pokud máme data zprávy v payloadu, použijeme je přímo
          if (payload.payload?.message) {
            const newMessage = payload.payload.message
            // Přidáme zprávu do seznamu, pokud tam ještě není
            if (!messages.value.some(m => m.id === newMessage.id)) {
              messages.value = [...messages.value, newMessage]

              // Pokud máme poslední čas přečtení a nová zpráva je novější,
              // zvýšíme počet nepřečtených zpráv
              if (lastRead?.last_read_at) {
                if (new Date(newMessage.created_at) > new Date(lastRead.last_read_at)) {
                  unreadCount.value++
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
                msg => new Date(msg.created_at) > new Date(lastReadTimestamp.value!)
              )
              unreadCount.value = unreadMessages.length
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
                unreadCount.value = 1
              }
            }
          }
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
      .subscribe()
  }

  // Odeslání nové zprávy
  const sendMessage = async (message: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) throw new Error('Uživatel není přihlášen')

      // Získáme jméno uživatele z user_roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('name')
        .eq('email', user.email)
        .single()

      if (!userRole?.name) {
        throw new Error('Uživatel nemá nastavené jméno')
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

  // Aktualizace stavu uživatele
  const updateUserStatus = async (isOnline: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Nejprve zkontrolujeme, zda má uživatel přístup k chatu
      const { data: chatUser } = await supabase
        .from('chat_users')
        .select('email')
        .eq('email', user.email)
        .single()

      if (!chatUser) {
        console.log('Uživatel nemá přístup k chatu')
        return
      }

      // Získáme jméno z user_roles
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('name')
        .eq('email', user.email)
        .single()

      if (!userRole?.name) {
        console.error('Uživatel nemá nastavené jméno')
        return
      }

      // Aktualizujeme stav pouze pro uživatele s přístupem
      await supabase
        .from('admin_chat_users')
        .upsert({
          email: user.email,
          name: userRole.name,
          avatar_url: user.user_metadata?.avatar_url,
          last_seen: new Date().toISOString(),
          is_online: isOnline
        })
    } catch (err) {
      console.error('Error updating user status:', err)
    }
  }

  // Načtení online uživatelů
  const fetchOnlineUsers = async () => {
    try {
      // Načteme uživatele z chat_users a připojíme jejich online status
      const { data, error } = await supabase
        .from('chat_users')
        .select(`
          email,
          name,
          created_at,
          user_roles!inner (
            name
          )
        `);

      if (error) throw error;

      // Transformujeme data do požadovaného formátu
      users.value = (data || []).map(user => ({
        email: user.email,
        name: user.name || user.user_roles.name, // Použijeme jméno z chat_users, nebo z user_roles jako fallback
        avatar_url: null, // Avatar zatím nepoužíváme
        last_seen: new Date().toISOString(),
        is_online: true, // Prozatím nastavíme všechny jako online
        is_typing: false
      }));
    } catch (err) {
      console.error('Error fetching online users:', err);
    }
  };

  // Signalizace psaní
  const signalTyping = async (isTyping: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      if (isTyping) {
        await subscription?.track({
          email: user.email,
          timestamp: new Date().toISOString()
        })
      } else {
        await subscription?.untrack()
      }
    } catch (err) {
      console.error('Error signaling typing:', err)
    }
  }

  // Cleanup
  const cleanup = () => {
    if (subscription) {
      subscription.untrack()
      subscription.unsubscribe()
      subscription = null
    }
    if (broadcastChannel) {
      broadcastChannel.unsubscribe()
      broadcastChannel = null
    }
    if (typingTimeout) {
      clearTimeout(typingTimeout)
    }
    updateUserStatus(false)
  }

  onMounted(async () => {
    try {
      await Promise.all([
        fetchMessages(),
        fetchOnlineUsers(),
        updateUserStatus(true)
      ])

      setupBroadcastChannel()
      setupSubscriptions()

      // Aktualizace stavu uživatele každých 30 sekund
      const interval = setInterval(() => {
        updateUserStatus(true)
      }, 30000)

      onUnmounted(() => {
        cleanup()
        clearInterval(interval)
      })
    } catch (error) {
      console.error('Error during initialization:', error)
    }
  })

  return {
    messages,
    users,
    loading,
    error,
    typingUsers,
    unreadCount,
    lastReadTimestamp,
    sendMessage,
    fetchMessages,
    fetchOnlineUsers,
    signalTyping,
    markMessageAsRead,
    markAllAsRead
  }
}