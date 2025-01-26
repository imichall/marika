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
          console.log('New order received:', payload); // Debug log
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
          console.log('Order updated:', payload); // Debug log
          handleOrderUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ticket_orders'
        },
        (payload) => {
          console.log('Order deleted:', payload); // Debug log
          handleOrderDelete(payload);
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status); // Debug log
      });
  };

  // Funkce pro přidání nové objednávky do lokálního stavu
  const handleNewOrder = async (payload: any) => {
    console.log('Handling new order:', payload); // Debug log
    const newOrder = payload.new;

    try {
      // Nejdřív načteme data koncertu
      const { data: concertData, error: concertError } = await supabase
        .from('concerts')
        .select('title')
        .eq('id', newOrder.concert_id)
        .single();

      if (concertError) {
        console.error('Error fetching concert data:', concertError);
        return;
      }

      // Vytvoříme kompletní objekt objednávky
      const orderWithConcert: TicketOrder = {
        ...newOrder,
        concert_name: concertData?.title || 'Neznámý koncert',
        concerts: { title: concertData?.title }
      };

      // Okamžitě aktualizujeme lokální stav
      orders.value = [orderWithConcert, ...orders.value];

      // Zobrazíme notifikaci
      const toast = useToast();
      toast.info(`Nová objednávka: ${orderWithConcert.concert_name}`);

      // Pro jistotu načteme všechna data pro synchronizaci
      getAllOrders();

      console.log('Orders after immediate update:', orders.value);
    } catch (err) {
      console.error('Error handling new order:', err);
    }
  };

  // Funkce pro aktualizaci existující objednávky v lokálním stavu
  const handleOrderUpdate = (payload: any) => {
    console.log('Handling order update:', payload); // Debug log
    const updatedOrder = payload.new;
    const index = orders.value.findIndex(order => order.id === updatedOrder.id);
    if (index !== -1) {
      // Vytvoříme nové pole pro reaktivitu
      const newOrders = [...orders.value];
      newOrders[index] = {
        ...orders.value[index],
        ...updatedOrder
      };
      orders.value = newOrders;
      console.log('Orders after update:', orders.value); // Debug log pro kontrolu stavu
    }
  };

  // Funkce pro smazání objednávky z lokálního stavu
  const handleOrderDelete = (payload: any) => {
    console.log('Handling order delete:', payload); // Debug log
    const deletedOrderId = payload.old.id;
    // Vytvoříme nové pole pro reaktivitu
    orders.value = orders.value.filter(order => order.id !== deletedOrderId);
    console.log('Orders after delete:', orders.value); // Debug log pro kontrolu stavu
  };

  // Cleanup subscriptions
  const cleanupSubscriptions = () => {
    if (subscription) {
      console.log('Cleaning up subscription'); // Debug log
      subscription.unsubscribe();
      subscription = null;
    }
    stopAutoRefresh();
  };

  onMounted(() => {
    console.log('Setting up subscriptions'); // Debug log
    setupSubscriptions();
  });

  onUnmounted(() => {
    console.log('Cleaning up subscriptions'); // Debug log
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
  };
};