import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";

interface Concert {
  id: number;
  title: string;
  description: string;
  date: string;
  price: string;
  image: string;
  group?: string;
  created_at: string;
  updated_at: string;
}

export const useConcerts = () => {
  const supabase = useSupabaseClient();
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
          description: String(item.description),
          date: String(item.date),
          price: String(item.price),
          image: String(item.image),
          group: item.group ? String(item.group) : undefined,
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
          id: data.id,
          title: String(data.title),
          description: String(data.description),
          date: String(data.date),
          price: String(data.price),
          image: String(data.image),
          group: data.group ? String(data.group) : undefined,
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
    getConcert
  };
};