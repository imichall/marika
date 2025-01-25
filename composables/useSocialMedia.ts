import { useSupabaseClient } from '#imports'
import { ref, onMounted } from '#imports'

// Create a simple event emitter
const socialMediaUpdateEvent = new EventTarget();
const SOCIAL_MEDIA_UPDATED = 'social-media-updated';

interface SocialMedia {
  id: string
  platform: string
  url: string
  icon: string
  choir_group_id: string | null
  created_at: string
  updated_at: string
}

export const useSocialMedia = () => {
  const supabase = useSupabaseClient()
  const socialMedia = ref<SocialMedia[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const notifyUpdate = () => {
    socialMediaUpdateEvent.dispatchEvent(new Event(SOCIAL_MEDIA_UPDATED));
  };

  const fetchSocialMedia = async () => {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('social_media')
        .select('*')
        .order('created_at', { ascending: true })

      if (err) throw err

      if (data) {
        socialMedia.value = data.map(item => ({
          id: String(item.id),
          platform: String(item.platform),
          url: String(item.url),
          icon: String(item.icon),
          choir_group_id: item.choir_group_id ? String(item.choir_group_id) : null,
          created_at: String(item.created_at),
          updated_at: String(item.updated_at)
        }))
      }
    } catch (err) {
      console.error('Error fetching social media:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  const addSocialMedia = async (data: Omit<SocialMedia, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      loading.value = true
      const { data: newSocialMedia, error: err } = await supabase
        .from('social_media')
        .insert(data)
        .select()
        .single()

      if (err) throw err

      if (newSocialMedia) {
        const typedNewSocialMedia: SocialMedia = {
          id: String(newSocialMedia.id),
          platform: String(newSocialMedia.platform),
          url: String(newSocialMedia.url),
          icon: String(newSocialMedia.icon),
          choir_group_id: newSocialMedia.choir_group_id ? String(newSocialMedia.choir_group_id) : null,
          created_at: String(newSocialMedia.created_at),
          updated_at: String(newSocialMedia.updated_at)
        }
        socialMedia.value = [...socialMedia.value, typedNewSocialMedia]
        notifyUpdate();
        return typedNewSocialMedia
      }
      throw new Error('No data returned from insert operation')
    } catch (err) {
      console.error('Error adding social media:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateSocialMedia = async (id: string, data: Partial<SocialMedia>) => {
    try {
      loading.value = true
      const { data: updatedSocialMedia, error: err } = await supabase
        .from('social_media')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      if (updatedSocialMedia) {
        const typedUpdatedSocialMedia: SocialMedia = {
          id: String(updatedSocialMedia.id),
          platform: String(updatedSocialMedia.platform),
          url: String(updatedSocialMedia.url),
          icon: String(updatedSocialMedia.icon),
          choir_group_id: updatedSocialMedia.choir_group_id ? String(updatedSocialMedia.choir_group_id) : null,
          created_at: String(updatedSocialMedia.created_at),
          updated_at: String(updatedSocialMedia.updated_at)
        }
        const index = socialMedia.value.findIndex(sm => sm.id === id)
        if (index !== -1) {
          socialMedia.value[index] = typedUpdatedSocialMedia
          socialMedia.value = [...socialMedia.value]
          notifyUpdate();
        }
        return typedUpdatedSocialMedia
      }
      throw new Error('No data returned from update operation')
    } catch (err) {
      console.error('Error updating social media:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteSocialMedia = async (id: string) => {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('social_media')
        .delete()
        .eq('id', id)

      if (err) throw err

      socialMedia.value = socialMedia.value.filter(sm => sm.id !== id)
      notifyUpdate();
    } catch (err) {
      console.error('Error deleting social media:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const getGroupSocialMedia = async (groupId: string) => {
    try {
      // Nejdřív získáme všechny sociální sítě pro skupinu
      const { data: groupSocialMedia, error: groupError } = await supabase
        .from('group_social_media')
        .select('social_media_id')
        .eq('group_id', groupId);

      if (groupError) throw groupError;

      // Pokud nemáme žádná data, vrátíme prázdné pole
      if (!groupSocialMedia?.length) return [];

      // Získáme detaily sociálních sítí
      const socialMediaIds = groupSocialMedia.map(gsm => gsm.social_media_id);
      const { data: socialMediaData, error: socialMediaError } = await supabase
        .from('social_media')
        .select('*')
        .in('id', socialMediaIds);

      if (socialMediaError) throw socialMediaError;

      return socialMediaData?.map(item => ({
        id: String(item.id),
        platform: String(item.platform),
        url: String(item.url),
        icon: String(item.icon),
        choir_group_id: item.choir_group_id ? String(item.choir_group_id) : null,
        created_at: String(item.created_at),
        updated_at: String(item.updated_at)
      })) || [];
    } catch (err) {
      console.error('Error fetching group social media:', err);
      throw err;
    }
  };

  // Přidáme novou metodu pro získání všech dostupných sociálních sítí pro skupinu
  const getAvailableSocialMedia = async (groupId?: string) => {
    try {
      let query = supabase
        .from('social_media')
        .select('*')
        .order('created_at', { ascending: true });

      // Pokud máme groupId, zahrneme i sociální sítě přiřazené této skupině
      if (groupId) {
        query = query.or(`choir_group_id.is.null,choir_group_id.eq.${groupId}`);
      } else {
        query = query.is('choir_group_id', null);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(item => ({
        id: String(item.id),
        platform: String(item.platform),
        url: String(item.url),
        icon: String(item.icon),
        choir_group_id: item.choir_group_id ? String(item.choir_group_id) : null,
        created_at: String(item.created_at),
        updated_at: String(item.updated_at)
      })) || [];
    } catch (err) {
      console.error('Error fetching available social media:', err);
      throw err;
    }
  };

  // Přidáme metodu pro uložení vazeb mezi skupinou a sociálními sítěmi
  const updateGroupSocialMediaLinks = async (groupId: string, socialMediaIds: string[]) => {
    try {
      loading.value = true;

      // Nejdřív smažeme všechny existující vazby pro tuto skupinu
      const { error: deleteError } = await supabase
        .from('group_social_media')
        .delete()
        .eq('group_id', groupId);

      if (deleteError) throw deleteError;

      // Pokud máme nové vazby, vytvoříme je
      if (socialMediaIds.length > 0) {
        const newLinks = socialMediaIds.map(socialMediaId => ({
          group_id: groupId,
          social_media_id: socialMediaId
        }));

        const { error: insertError } = await supabase
          .from('group_social_media')
          .insert(newLinks);

        if (insertError) throw insertError;
      }

      // Aktualizujeme lokální stav
      await fetchSocialMedia();
      notifyUpdate();
    } catch (err) {
      console.error('Error updating group social media links:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  onMounted(async () => {
    await fetchSocialMedia()
  })

  return {
    socialMedia,
    loading,
    error,
    fetchSocialMedia,
    addSocialMedia,
    updateSocialMedia,
    deleteSocialMedia,
    onSocialMediaUpdate: (callback: () => void) => {
      socialMediaUpdateEvent.addEventListener(SOCIAL_MEDIA_UPDATED, callback);
      return () => socialMediaUpdateEvent.removeEventListener(SOCIAL_MEDIA_UPDATED, callback);
    },
    getGroupSocialMedia,
    getAvailableSocialMedia,
    updateGroupSocialMediaLinks
  }
}
