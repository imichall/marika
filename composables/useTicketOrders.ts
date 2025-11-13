import { ref, onUnmounted, onMounted } from 'vue';
import { useSupabaseClient, useToast } from '#imports';

interface TicketOrder {
  id: number;
  concert_id: number;
  customer_name: string;
  customer_email: string;
  ticket_count: number;
  total_price: number;
  payment_status: 'pending' | 'completed' | 'cancelled';
  variable_symbol?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  concert_name?: string;
  concerts?: {
    title: string;
  };
}

interface CreateTicketOrder {
  concert_id: number;
  customer_name: string;
  customer_email: string;
  ticket_count: number;
  total_price: number;
  variable_symbol?: string;
}

export const useTicketOrders = () => {
  const supabase = useSupabaseClient<{ ticket_orders: TicketOrder }>();
  const orders = ref<TicketOrder[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  let refreshInterval: NodeJS.Timeout | null = null;
  let subscription: ReturnType<typeof supabase.channel> | null = null;

  const createOrder = async (orderData: CreateTicketOrder) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('ticket_orders')
        .insert([orderData])
        .select()
        .single();

      if (err) throw err;

      return data;
    } catch (err) {
      console.error('Error creating ticket order:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getMyOrders = async (email: string) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('ticket_orders')
        .select('*')
        .eq('customer_email', email)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (err) throw err;

      if (data) {
        orders.value = data;
      }
      return data;
    } catch (err) {
      console.error('Error fetching orders:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getAllOrders = async () => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('ticket_orders')
        .select(`
          *,
          concerts (
            title
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (err) throw err;

      if (data) {
        orders.value = data.map((order: TicketOrder) => ({
          ...order,
          concert_name: order.concerts?.title || 'Neznámý koncert'
        }));
      }
      return data;
    } catch (err) {
      console.error('Error fetching all orders:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateOrderStatus = async (orderId: number, status: TicketOrder['payment_status']) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('ticket_orders')
        .update({ payment_status: status })
        .eq('id', orderId)
        .select()
        .single();

      if (err) throw err;

      // Aktualizujeme lokální stav
      if (data) {
        const index = orders.value.findIndex(order => order.id === orderId);
        if (index !== -1) {
          orders.value[index] = data;
        }
      }

      return data;
    } catch (err) {
      console.error('Error updating order status:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteOrder = async (orderId: number) => {
    try {
      loading.value = true;
      // Soft delete - místo DELETE použijeme UPDATE a nastavíme is_active = false
      const { data, error: err } = await supabase
        .from('ticket_orders')
        .update({ is_active: false })
        .eq('id', orderId)
        .eq('is_active', true) // Pouze pokud je ještě aktivní
        .select()
        .single();

      if (err) {
        console.error('Error deleting order - Supabase error:', err);
        console.error('Error details:', JSON.stringify(err, null, 2));
        throw err;
      }

      // Remove from local state
      orders.value = orders.value.filter(order => order.id !== orderId);

      return data;
    } catch (err) {
      console.error('Error deleting order:', err);
      if (err && typeof err === 'object' && 'message' in err) {
        error.value = err.message as string;
      } else {
        error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Funkce pro nastavení automatického obnovování
  const startAutoRefresh = (intervalMs: number = 30000) => {
    stopAutoRefresh(); // Nejdřív zastavíme případný běžící interval
    refreshInterval = setInterval(getAllOrders, intervalMs);
  };

  // Funkce pro zastavení automatického obnovování
  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  // Nastavení real-time subscriptions
  const setupSubscriptions = () => {
    // Nejdřív načteme aktuální data
    getAllOrders();

    // Pak nastavíme subscription
    subscription = supabase
      .channel('ticket_orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_orders'
        },
        (payload) => {
          handleNewOrder(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ticket_orders'
        },
        (payload) => {
          handleOrderUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ticket_orders',
          filter: 'is_active=eq.false'
        },
        (payload) => {
          // Zkontrolujeme, zda se změnil is_active z true na false
          if (payload.old && payload.old.is_active === true && payload.new.is_active === false) {
            handleOrderDelete(payload);
          }
        }
      )
  };

  // Funkce pro přidání nové objednávky do lokálního stavu
  const handleNewOrder = async (payload: any) => {
    const newOrder = payload.new;

    try {
      const { data: concertData, error: concertError } = await supabase
        .from('concerts')
        .select('title')
        .eq('id', newOrder.concert_id)
        .single();

      if (concertError) {
        console.error('Error fetching concert data:', concertError);
        const toast = useToast();
        toast.error('Chyba při načítání dat koncertu');
        return;
      }

      const orderWithConcert: TicketOrder = {
        ...newOrder,
        concert_name: concertData?.title || 'Neznámý koncert',
        concerts: { title: concertData?.title }
      };

      orders.value = [orderWithConcert, ...orders.value];

      const toast = useToast();
      toast.success(`Nová objednávka: ${orderWithConcert.concert_name} (${orderWithConcert.ticket_count}x)`);

      getAllOrders();
    } catch (err) {
      console.error('Error handling new order:', err);
      const toast = useToast();
      toast.error('Chyba při zpracování nové objednávky');
    }
  };

  // Funkce pro aktualizaci existující objednávky v lokálním stavu
  const handleOrderUpdate = (payload: any) => {
    const updatedOrder = payload.new;
    const oldOrder = payload.old;

    // Pokud se is_active změnil z true na false, jedná se o soft delete
    if (oldOrder.is_active === true && updatedOrder.is_active === false) {
      handleOrderDelete(payload);
      return;
    }

    const index = orders.value.findIndex(order => order.id === updatedOrder.id);
    if (index !== -1) {
      const newOrders = [...orders.value];
      newOrders[index] = {
        ...orders.value[index],
        ...updatedOrder
      };
      orders.value = newOrders;

      // Zobrazíme toast notifikaci při změně stavu platby
      if (oldOrder.payment_status !== updatedOrder.payment_status) {
        const toast = useToast();
        const orderName = orders.value[index].concert_name || 'Neznámý koncert';

        switch (updatedOrder.payment_status) {
          case 'completed':
            toast.success(`Objednávka ${orderName} byla zaplacena`);
            break;
          case 'cancelled':
            toast.warning(`Objednávka ${orderName} byla zrušena`);
            break;
          case 'pending':
            toast.info(`Objednávka ${orderName} čeká na platbu`);
            break;
        }
      }
    }
  };

  // Funkce pro smazání objednávky z lokálního stavu
  // Nyní se jedná o soft delete, takže se objednávka aktualizuje (is_active = false)
  const handleOrderDelete = (payload: any) => {
    // Pokud je to UPDATE s is_active změnou, zpracujeme to jako soft delete
    if (payload.new && payload.new.is_active === false && payload.old.is_active === true) {
      const deletedOrderId = payload.new.id;
      const deletedOrder = orders.value.find(order => order.id === deletedOrderId);

      orders.value = orders.value.filter(order => order.id !== deletedOrderId);

      if (deletedOrder) {
        const toast = useToast();
        toast.warning(`Objednávka ${deletedOrder.concert_name || 'Neznámý koncert'} byla smazána`);
      }
    }
  };

  // Cleanup subscriptions
  const cleanupSubscriptions = () => {
    if (subscription) {
      subscription.unsubscribe();
      subscription = null;
    }
    stopAutoRefresh();
  };

  onMounted(() => {
    setupSubscriptions();
  });

  onUnmounted(() => {
    cleanupSubscriptions();
  });

  return {
    orders,
    loading,
    error,
    createOrder,
    getMyOrders,
    getAllOrders,
    updateOrderStatus,
    startAutoRefresh,
    stopAutoRefresh,
    deleteOrder
  };
};