import { ref, onMounted } from "vue";
import { useSupabaseClient } from "~/utils/supabase";

export const useConcerts = () => {
  const supabase = useSupabaseClient();
  const concerts = ref([]);
  const loading = ref(false);
  const error = ref(null);

  // Načtení koncertů
  const fetchConcerts = async () => {
    try {
      loading.value = true;
      error.value = null;

      console.log('Fetching concerts...');

      // Přidáme více logování
      const supabaseResponse = await supabase
        .from("concerts")
        .select("*")
        .order("date", { ascending: true });

      console.log('Supabase response:', supabaseResponse);

      if (supabaseResponse.error) {
        console.error('Supabase error:', supabaseResponse.error);
        throw supabaseResponse.error;
      }

      const data = supabaseResponse.data || [];
      console.log('Fetched data:', data);

      // Mapování dat pro frontend
      concerts.value = data.map(concert => ({
        id: concert.id,
        title: concert.title,
        date: concert.date,
        desc: concert.description,
        group: concert.group_name,
        price: concert.price,
        image: concert.image,
        qr_code: concert.qr_code
      }));

      console.log('Mapped concerts:', concerts.value);
    } catch (err) {
      console.error("Error fetching concerts:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Přidání koncertu
  const addConcert = async (concert) => {
    try {
      loading.value = true;
      error.value = null;

      // Validace vstupních dat
      if (!concert.title || !concert.date || !concert.group || concert.price === undefined) {
        throw new Error('Chybí povinné údaje');
      }

      const concertData = {
        title: concert.title,
        date: concert.date,
        description: concert.desc,
        group_name: concert.group,
        price: Number(concert.price),
        image: concert.image,
        qr_code: concert.qr_code
      };

      console.log('Adding concert:', concertData);

      // Odstraníme .single() a zpracujeme data manuálně
      const { data, error: insertError } = await supabase
        .from("concerts")
        .insert([concertData])
        .select('*');

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      if (!data || data.length === 0) {
        throw new Error('Koncert nebyl vytvořen');
      }

      const newConcert = data[0]; // Vezmeme první záznam
      console.log('Added concert data:', newConcert);

      // Přidáme do lokálního stavu
      concerts.value.push({
        id: newConcert.id,
        title: newConcert.title,
        date: newConcert.date,
        desc: newConcert.description,
        group: newConcert.group_name,
        price: newConcert.price,
        image: newConcert.image,
        qr_code: newConcert.qr_code
      });

      console.log('Local state updated:', concerts.value);
      return newConcert;
    } catch (err) {
      console.error("Error adding concert:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Aktualizace koncertu
  const updateConcert = async (id, concert) => {
    try {
      loading.value = true;
      error.value = null;

      if (!id) {
        throw new Error('ID koncertu je povinné');
      }

      // Validace vstupních dat
      if (!concert.title || !concert.date || !concert.group || concert.price === undefined) {
        throw new Error('Chybí povinné údaje');
      }

      const concertData = {
        title: concert.title,
        date: concert.date,
        description: concert.desc,
        group_name: concert.group,
        price: Number(concert.price),
        image: concert.image,
        qr_code: concert.qr_code
      };

      console.log('Updating concert with ID:', id);
      console.log('Update data:', concertData);

      // Nejprve ověříme, že koncert existuje
      const { data: checkData, error: checkError } = await supabase
        .from('concerts')
        .select()
        .eq('id', id);

      if (checkError) {
        console.error('Error checking concert:', checkError);
        throw checkError;
      }

      console.log('Check data:', checkData);

      if (!checkData || checkData.length === 0) {
        throw new Error(`Koncert s ID ${id} nebyl nalezen`);
      }

      // Provedeme update
      const { data, error: updateError } = await supabase
        .from('concerts')
        .update(concertData)
        .eq('id', id)
        .select();

      console.log('Update result:', { data, updateError });

      if (updateError) {
        console.error('Error updating concert:', updateError);
        throw updateError;
      }

      if (!data || data.length === 0) {
        throw new Error('Koncert nebyl aktualizován');
      }

      const updatedConcert = data[0];
      console.log('Updated concert:', updatedConcert);

      // Aktualizujeme lokální stav
      const index = concerts.value.findIndex(c => c.id === id);
      if (index !== -1) {
        concerts.value[index] = {
          id: updatedConcert.id,
          title: updatedConcert.title,
          date: updatedConcert.date,
          desc: updatedConcert.description,
          group: updatedConcert.group_name,
          price: updatedConcert.price,
          image: updatedConcert.image,
          qr_code: updatedConcert.qr_code
        };
      }

      console.log('Local state updated:', concerts.value);
      return updatedConcert;
    } catch (err) {
      console.error("Error updating concert:", err);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Smazání koncertu
  const deleteConcert = async (id) => {
    try {
      loading.value = true;
      error.value = null;

      console.log('Deleting concert:', id);

      const { error: deleteError } = await supabase
        .from("concerts")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
        throw deleteError;
      }

      console.log('Deleted concert:', id);

      await fetchConcerts(); // Znovu načteme všechna data
    } catch (err) {
      console.error("Error deleting concert:", err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  // Načtení koncertů při inicializaci
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