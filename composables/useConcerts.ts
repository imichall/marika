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
  variable_symbol: string | null;
  qr_session: string | null;
  account_number: string | null;
  bank_code: string | null;
}

export const useConcerts = () => {
  const concerts = ref<Concert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const supabase = useSupabaseClient();

  const generateQRSession = (concert: Partial<Concert>) => {
    const data = {
      title: concert.title,
      date: concert.date,
      price: concert.price,
      vs: concert.variable_symbol,
      account: concert.account_number,
      bank_code: concert.bank_code,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(data));
  };

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
        variable_symbol: concert.variable_symbol ? String(concert.variable_symbol) : null,
        qr_session: concert.qr_session ? String(concert.qr_session) : null,
        account_number: concert.account_number ? String(concert.account_number) : null,
        bank_code: concert.bank_code ? String(concert.bank_code) : null
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

      const qr_session = generateQRSession(data);

      const concertData = {
        title: data.title,
        date: data.date,
        description: data.desc,
        group_name: data.group,
        price: Number(data.price),
        image: data.image,
        variable_symbol: data.variable_symbol,
        account_number: data.account_number,
        bank_code: data.bank_code,
        qr_session
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
        variable_symbol: newData.variable_symbol ? String(newData.variable_symbol) : null,
        qr_session: newData.qr_session ? String(newData.qr_session) : null,
        account_number: newData.account_number ? String(newData.account_number) : null,
        bank_code: newData.bank_code ? String(newData.bank_code) : null
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

      const qr_session = generateQRSession({
        ...data,
        variable_symbol: data.variable_symbol || undefined,
        account_number: data.account_number || undefined,
        bank_code: data.bank_code || undefined
      });

      const updateData = {
        title: data.title,
        date: data.date,
        description: data.desc,
        group_name: data.group,
        price: data.price !== undefined ? Number(data.price) : undefined,
        image: data.image,
        variable_symbol: data.variable_symbol || null,
        account_number: data.account_number || null,
        bank_code: data.bank_code || null,
        qr_session
      };

      const { data: updatedConcert, error: err } = await supabase
        .from('concerts')
        .update(updateData)
        .match({ id })
        .select()
        .single();

      if (err) throw err;

      if (!updatedConcert) {
        throw new Error('Koncert nebyl nalezen');
      }

      const concert: Concert = {
        id: String(updatedConcert.id),
        title: String(updatedConcert.title),
        date: String(updatedConcert.date),
        desc: updatedConcert.description ? String(updatedConcert.description) : null,
        group: String(updatedConcert.group_name),
        price: Number(updatedConcert.price),
        image: updatedConcert.image ? String(updatedConcert.image) : null,
        variable_symbol: updatedConcert.variable_symbol ? String(updatedConcert.variable_symbol) : null,
        qr_session: updatedConcert.qr_session ? String(updatedConcert.qr_session) : null,
        account_number: updatedConcert.account_number ? String(updatedConcert.account_number) : null,
        bank_code: updatedConcert.bank_code ? String(updatedConcert.bank_code) : null
      };

      // Aktualizujeme lokální stav
      const index = concerts.value.findIndex(c => c.id === id);
      if (index !== -1) {
        concerts.value[index] = concert;
      }

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
        .match({ id });

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