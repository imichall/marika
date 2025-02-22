import { ref, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'

export interface ChatMessage {
  id: string
  sender_email: string
  sender_name: string
  message: string
  created_at: string
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
      const { data, error: err } = await supabase
        .from('admin_chat_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50)

      if (err) throw err
      messages.value = data || []
    } catch (err) {
      console.error('Error fetching messages:', err)
      error.value = err instanceof Error ? err.message : 'Nepodařilo se načíst zprávy'
    } finally {
      loading.value = false
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
        async () => {
          console.log('Přijat signál o nové zprávě')
          await fetchMessages()
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

        // Odešleme broadcast všem připojeným klientům
        await subscription.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { messageId: data.id }
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
      const { data, error: err } = await supabase
        .from('admin_chat_users')
        .select('*')
        .order('last_seen', { ascending: false })

      if (err) throw err
      users.value = data || []
    } catch (err) {
      console.error('Error fetching online users:', err)
    }
  }

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
    sendMessage,
    fetchMessages,
    fetchOnlineUsers,
    signalTyping
  }
}