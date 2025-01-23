import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";

interface Concert {
  id: string;
  title: string;
  date: string;
  desc: string | null;
  group: string;
  price: number;
  image: string | null;
  qr_code: string | null;
}

export const useConcerts = () => {
  const concerts = ref<Concert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const supabase = useSupabaseClient();

  const fetchConcerts = async () => {
    try {
      loading.value = true;
      error.value = null;

      console.log('Fetching concerts...');
      const { data, error: err } = await supabase
        .from("concerts")
        .select("*")
        .order("date", { ascending: true });

      if (err) throw err;

      console.log('Fetched data:', data);
      concerts.value = data?.map(concert => ({
        id: String(concert.id),
        title: String(concert.title),
        date: String(concert.date),
        desc: concert.description ? String(concert.description) : null,
        group: String(concert.group_name),
        price: Number(concert.price),
        image: concert.image ? String(concert.image) : null,
        qr_code: concert.qr_code ? String(concert.qr_code) : null
      })) || [];

      console.log('Mapped concerts:', concerts.value);
    } catch (err: any) {
      console.error("Error fetching concerts:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  const addConcert = async (data: Omit<Concert, 'id'>) => {
    try {
      loading.value = true;
      error.value = null;

      const concertData = {
        title: data.title,
        date: data.date,
        description: data.desc,
        group_name: data.group,
        price: Number(data.price),
        image: data.image,
        qr_code: data.qr_code
      };

      console.log('Adding concert:', concertData);
      const { data: newData, error: err } = await supabase
        .from("concerts")
        .insert([concertData])
        .select()
        .single();

      if (err) throw err;

      if (!newData) {
        throw new Error('Koncert nebyl vytvořen');
      }

      const concert: Concert = {
        id: String(newData.id),
        title: String(newData.title),
        date: String(newData.date),
        desc: newData.description ? String(newData.description) : null,
        group: String(newData.group_name),
        price: Number(newData.price),
        image: newData.image ? String(newData.image) : null,
        qr_code: newData.qr_code ? String(newData.qr_code) : null
      };

      console.log('Added concert:', concert);
      concerts.value.push(concert);
      return concert;
    } catch (err: any) {
      console.error("Error adding concert:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateConcert = async (id: string, data: Partial<Concert>) => {
    try {
      loading.value = true;
      error.value = null;

      console.log('Updating concert with ID:', id);
      console.log('Update data:', data);

      const concertData = {
        title: data.title,
        date: data.date,
        description: data.desc,
        group_name: data.group,
        price: data.price !== undefined ? Number(data.price) : undefined,
        image: data.image,
        qr_code: data.qr_code
      };

      const { data: updatedData, error: updateError } = await supabase
        .from('concerts')
        .update(concertData)
        .eq('id', id)
        .select()
        .single();

      console.log('Update result:', { updatedData, updateError });

      if (updateError) {
        console.error('Error updating concert:', updateError);
        throw updateError;
      }

      if (!updatedData) {
        throw new Error('Koncert nebyl aktualizován');
      }

      const concert: Concert = {
        id: String(updatedData.id),
        title: String(updatedData.title),
        date: String(updatedData.date),
        desc: updatedData.description ? String(updatedData.description) : null,
        group: String(updatedData.group_name),
        price: Number(updatedData.price),
        image: updatedData.image ? String(updatedData.image) : null,
        qr_code: updatedData.qr_code ? String(updatedData.qr_code) : null
      };

      console.log('Updated concert:', concert);

      const index = concerts.value.findIndex(c => c.id === id);
      if (index !== -1) {
        concerts.value[index] = concert;
      }

      console.log('Local state updated:', concerts.value);
      return concert;
    } catch (err: any) {
      console.error("Error updating concert:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteConcert = async (id: string) => {
    try {
      loading.value = true;
      error.value = null;

      console.log('Deleting concert:', id);
      const { error: err } = await supabase
        .from("concerts")
        .delete()
        .eq("id", id);

      if (err) throw err;

      console.log('Concert deleted:', id);
      concerts.value = concerts.value.filter(c => c.id !== id);
    } catch (err: any) {
      console.error("Error deleting concert:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchConcerts();
  });

  return {
    concerts,
    loading,
    error,
    fetchConcerts,
    addConcert,
    updateConcert,
    deleteConcert,
  };
};