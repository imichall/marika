import { ref, onUnmounted } from 'vue';
import { useSupabaseClient } from '#imports';

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

  // Cleanup při unmount
  onUnmounted(() => {
    stopAutoRefresh();
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
    stopAutoRefresh
  };
};