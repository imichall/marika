import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";

interface ConcertRow {
  id: number;
  title: string;
  description: string | null;
  desc: string | null;
  date: string;
  time: string | null;
  price: number;
  image: string | null;
  group: string | null;
  group_name: string | null;
  variable_symbol: string;
  account_number: string;
  bank_code: string;
  qr_session: string | null;
  ticket_id: string | null;
  poster_id: string | null;
  created_at: string;
  updated_at: string;
  is_voluntary: boolean;
}

interface ConcertTicket {
  id: string;
  title: string;
  provider: string;
  ticket_url: string;
}

interface ConcertPoster {
  id: string;
  concert_id: number;
  image_url: string;
  title: string;
  created_at: string;
}

interface Concert {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  price: number;
  image: string;
  group_name?: string;
  group?: string;
  desc?: string;
  variable_symbol?: string;
  account_number?: string;
  bank_code?: string;
  qr_session?: string | null;
  ticket_id?: string | null;
  poster_id?: string | null;
  ticket?: ConcertTicket | null;
  poster?: ConcertPoster | null;
  created_at: string;
  updated_at: string;
  is_voluntary: boolean;
}

const formatTime = (time: string | null): string => {
  if (!time) return '19:00';
  return time.substring(0, 5);
};

export const useConcerts = () => {
  const supabase = useSupabaseClient<{ concerts: ConcertRow }>();
  const concerts = ref<Concert[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const posterUploadProgress = ref(0);
  const isPosterUploading = ref(false);

  const fetchConcerts = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from('concerts')
        .select(`
          *,
          poster:posters!concerts_poster_id_fkey (
            id,
            image_url,
            title
          )
        `)
        .order('date', { ascending: false });

      if (err) throw err;
      concerts.value = data.map(concert => ({
        ...concert,
        poster: concert.poster || null
      }));
    } catch (err) {
      error.value = err.message;
      console.error('Error fetching concerts:', err);
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
      const { data, error: err } = await supabase
        .from('concerts')
        .select(`
          *,
          poster:posters!concerts_poster_id_fkey (
            id,
            image_url,
            title
          )
        `)
        .eq('id', id)
        .single();

      if (err) throw err;
      return {
        ...data,
        poster: data.poster || null
      };
    } catch (err) {
      console.error('Error fetching concert:', err);
      throw err;
    }
  };

  const uploadPoster = async (concertId: number, file: File) => {
    try {
      isPosterUploading.value = true;
      posterUploadProgress.value = 0;
      const timestamp = Date.now();
      const fileName = `poster-${timestamp}-${file.name.toLowerCase().replace(/[^a-z0-9.]/g, '-')}`;

      // Create FormData
      const formData = new FormData();
      formData.append('image', file, fileName);

      // Upload using XMLHttpRequest for progress tracking
      const response = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            posterUploadProgress.value = Math.round((event.loaded / event.total) * 100);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.response));
          } else {
            reject(new Error(xhr.response || 'Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open('POST', '/api/upload');
        xhr.send(formData);
      });

      if (!response.success) {
        throw new Error('Upload failed');
      }

      // Create poster record
      const { data: posterData, error: posterError } = await supabase
        .from('posters')
        .insert([{
          concert_id: concertId,
          image_url: response.path,
          title: file.name
        }])
        .select()
        .single();

      if (posterError) throw posterError;

      // Update concert with poster_id
      const { error: concertError } = await supabase
        .from('concerts')
        .update({ poster_id: posterData.id })
        .eq('id', concertId);

      if (concertError) throw concertError;

      await fetchConcerts();
      return { success: true, poster: posterData };
    } catch (err) {
      console.error('Error uploading poster:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, error: error.value };
    } finally {
      isPosterUploading.value = false;
      posterUploadProgress.value = 0;
    }
  };

  const deletePoster = async (concertId: number) => {
    try {
      loading.value = true;
      const concert = concerts.value.find(c => c.id === concertId);
      if (!concert?.poster) return { success: false, error: 'No poster found' };

      // Delete from storage
      const fileName = concert.poster.image_url.split('/').pop();
      if (!fileName) throw new Error('Invalid poster URL');

      const { error: storageError } = await supabase
        .storage
        .from('posters')
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database and update concert
      const { error: dbError } = await supabase
        .from('concerts')
        .update({ poster_id: null })
        .eq('id', concertId);

      if (dbError) throw dbError;

      // Okamžitě aktualizujeme lokální stav
      const concertIndex = concerts.value.findIndex(c => c.id === concertId);
      if (concertIndex !== -1) {
        const updatedConcert = {
          ...concerts.value[concertIndex],
          poster_id: null as string | null,
          poster: null as ConcertPoster | null
        };
        concerts.value[concertIndex] = updatedConcert;
      }

      return { success: true };
    } catch (err: unknown) {
      console.error('Error deleting poster:', err);
      error.value = err instanceof Error ? err.message : 'Unknown error occurred';
      return { success: false, error: error.value };
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
    getConcert,
    uploadPoster,
    deletePoster,
    posterUploadProgress,
    isPosterUploading
  };
};