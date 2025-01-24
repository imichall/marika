import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";

interface ConcertRow {
  id: number;
  title: string;
  description: string | null;
  desc: string | null;
  date: string;
  price: string;
  image: string | null;
  group: string | null;
  group_name: string | null;
  variable_symbol: string | null;
  account_number: string | null;
  bank_code: string | null;
  qr_session: string | null;
  created_at: string;
  updated_at: string;
}

interface Concert {
  id: number;
  title: string;
  description: string;
  date: string;
  price: string;
  image: string;
  group_name?: string;
  group?: string;
  desc?: string;
  variable_symbol?: string;
  account_number?: string;
  bank_code?: string;
  qr_session?: string;
  created_at: string;
  updated_at: string;
}

export const useConcerts = () => {
  const supabase = useSupabaseClient<{ concerts: ConcertRow }>();
  const concerts = ref<Concert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchConcerts = async () => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('concerts')
        .select('*')
        .order('date', { ascending: true });

      if (err) throw err;

      if (data) {
        concerts.value = data.map(item => ({
          id: Number(item.id),
          title: String(item.title),
          description: String(item.description || ''),
          desc: String(item.desc || ''),
          date: String(item.date),
          price: String(item.price),
          image: String(item.image || ''),
          group: String(item.group || ''),
          group_name: item.group_name ? String(item.group_name) : undefined,
          variable_symbol: item.variable_symbol ? String(item.variable_symbol) : undefined,
          account_number: item.account_number ? String(item.account_number) : undefined,
          bank_code: item.bank_code ? String(item.bank_code) : undefined,
          qr_session: item.qr_session ? String(item.qr_session) : undefined,
          created_at: String(item.created_at),
          updated_at: String(item.updated_at)
        }));
      }
    } catch (err) {
      console.error('Error fetching concerts:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    } finally {
      loading.value = false;
    }
  };

  const addConcert = async (concertData: Partial<Concert>) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('concerts')
        .insert([concertData])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        await fetchConcerts();
      }
      return data;
    } catch (err) {
      console.error('Error adding concert:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateConcert = async (id: number, concertData: Partial<Concert>) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('concerts')
        .update(concertData)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      if (data) {
        await fetchConcerts();
      }
      return data;
    } catch (err) {
      console.error('Error updating concert:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteConcert = async (id: number) => {
    try {
      loading.value = true;
      const { error: err } = await supabase
        .from('concerts')
        .delete()
        .eq('id', id);

      if (err) throw err;

      await fetchConcerts();
    } catch (err) {
      console.error('Error deleting concert:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getConcert = async (id: number) => {
    try {
      loading.value = true;
      const { data, error: err } = await supabase
        .from('concerts')
        .select('*')
        .eq('id', id)
        .single();

      if (err) throw err;

      if (data) {
        return {
          id: Number(data.id),
          title: String(data.title),
          description: String(data.description || ''),
          desc: String(data.desc || ''),
          date: String(data.date),
          price: String(data.price),
          image: String(data.image || ''),
          group: String(data.group || ''),
          group_name: data.group_name ? String(data.group_name) : undefined,
          variable_symbol: data.variable_symbol ? String(data.variable_symbol) : undefined,
          account_number: data.account_number ? String(data.account_number) : undefined,
          bank_code: data.bank_code ? String(data.bank_code) : undefined,
          qr_session: data.qr_session ? String(data.qr_session) : undefined,
          created_at: String(data.created_at),
          updated_at: String(data.updated_at)
        };
      }
      return null;
    } catch (err) {
      console.error('Error fetching concert:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      return null;
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await fetchConcerts();
  });

  return {
    concerts,
    loading,
    error,
    fetchConcerts,
    addConcert,
    updateConcert,
    deleteConcert,
    getConcert
  };
};