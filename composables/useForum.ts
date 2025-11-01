import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";
import { slugify } from "~/utils/string.js";

export interface ForumTopic {
  id: string;
  title: string;
  slug: string | null;
  content: string;
  category: "general" | "announcement" | "help";
  tag?: string; // Deprecated: kept for backward compatibility
  tags?: string[]; // Array of tag slugs
  author_email: string;
  author_name: string;
  status: "active" | "locked" | "archived";
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  reply_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  topic_id: string;
  parent_reply_id: string | null;
  author_email: string;
  author_name: string;
  content: string;
  is_best_answer: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumTopicLike {
  id: string;
  topic_id: string;
  user_email: string;
  created_at: string;
}

export interface ForumReplyLike {
  id: string;
  reply_id: string;
  user_email: string;
  created_at: string;
}

export interface ForumTopicEditHistory {
  id: string;
  topic_id: string;
  edited_by_email: string;
  edited_by_name: string;
  old_title: string | null;
  new_title: string | null;
  old_content: string | null;
  new_content: string | null;
  old_category: string | null;
  new_category: string | null;
  old_tag: string | null;
  new_tag: string | null;
  created_at: string;
}

export interface ForumTopicView {
  id: string;
  topic_id: string;
  viewed_by_email: string;
  viewed_by_name: string;
  session_id: string | null;
  viewed_at: string;
}

// Funkce pro získání nebo vytvoření unikátního session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  const sessionKey = 'forum_session_id';
  let sessionId = sessionStorage.getItem(sessionKey);

  if (!sessionId) {
    // Generuj unikátní session ID
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(sessionKey, sessionId);
  }

  return sessionId;
};

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export interface ForumTag {
  id: string;
  name: string;
  slug: string;
  color: string;
  created_at: string;
}

export const useForum = () => {
  const supabase = useSupabaseClient();
  const topics = ref<ForumTopic[]>([]);
  const topic = ref<ForumTopic | null>(null);
  const replies = ref<ForumReply[]>([]);
  const editHistory = ref<ForumTopicEditHistory[]>([]);
  const views = ref<ForumTopicView[]>([]);
  const categories = ref<ForumCategory[]>([]);
  const tags = ref<ForumTag[]>([]);
  const topicUserLikes = ref<string[]>([]);
  const topicUserDislikes = ref<string[]>([]);
  const replyUserLikes = ref<string[]>([]);
  const replyUserDislikes = ref<string[]>([]);
  const loading = ref(false);
  const topicLoading = ref(false);
  const error = ref<string | null>(null);

  // Načtení všech témat
  const fetchTopics = async (filters?: {
    category?: string;
    status?: string;
    is_pinned?: boolean;
    tag?: string;
  }) => {
    loading.value = true;
    error.value = null;
    try {
      let query = supabase
        .from("forum_topics")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("last_activity_at", { ascending: false });

      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.status) {
        if (filters.status.startsWith("!")) {
          // Negace filtru (např. "!archived")
          const statusValue = filters.status.substring(1);
          query = query.neq("status", statusValue);
        } else {
          query = query.eq("status", filters.status);
        }
      }
      if (filters?.is_pinned !== undefined) {
        query = query.eq("is_pinned", filters.is_pinned);
      }
      if (filters?.tag) {
        query = query.eq("tag", filters.tag);
      }

      const { data, error: err } = await query;

      if (err) throw err;

      // Načteme tagy pro všechna témata
      if (data && data.length > 0) {
        const topicIds = data.map((t: any) => t.id);

        // Načteme všechny vztahy tag-topic
        const { data: topicTags } = await supabase
          .from("forum_topic_tags")
          .select("topic_id, forum_tags!inner(slug)")
          .in("topic_id", topicIds);

        // Přiřadíme tagy k jednotlivým tématům
        if (topicTags) {
          for (const topic of data) {
            const topicTagSlugs = topicTags
              .filter((tt: any) => tt.topic_id === topic.id)
              .map((tt: any) => tt.forum_tags.slug);
            topic.tags = topicTagSlugs;
            // Pro zpětnou kompatibilitu - použijeme první tag nebo starý tag sloupec
            if (!topic.tag && topicTagSlugs.length > 0) {
              topic.tag = topicTagSlugs[0];
            }
          }
        }
      }

      topics.value = data || [];
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error fetching topics:", err);
    } finally {
      loading.value = false;
    }
  };

  // Načtení jednoho tématu podle slug nebo id
  const fetchTopic = async (slugOrId: string) => {
    topicLoading.value = true;
    error.value = null;
    // Neresetujeme topic.value hned, aby se nezobrazila chybová zpráva během načítání
    // topic.value = null; // Odstraněno - necháme staré téma, dokud se nenačte nové
    try {
      // Zkusíme najít podle slug, pokud ne, tak podle id
      let query = supabase
        .from("forum_topics")
        .select("*")
        .eq("slug", slugOrId);

      let { data, error: err } = await query.single();

      // Pokud nenajdeme podle slug, zkusíme podle id (pro zpětnou kompatibilitu)
      if (err) {
        const idQuery = supabase
          .from("forum_topics")
          .select("*")
          .eq("id", slugOrId);

        const result = await idQuery.single();
        data = result.data;
        err = result.error;
      }

      if (err) throw err;

      // Pokud téma nemá slug, vygenerujeme ho
      if (data && !data.slug) {
        const slug = slugify(data.title);
        // Zkontrolujeme, zda slug už neexistuje
        const { data: existing } = await supabase
          .from("forum_topics")
          .select("id")
          .eq("slug", slug)
          .neq("id", data.id)
          .single();

        let finalSlug = slug;
        if (existing) {
          // Pokud slug existuje, přidáme id na konec
          finalSlug = `${slug}-${data.id.substring(0, 8)}`;
        }

        // Aktualizujeme slug v databázi
        await supabase
          .from("forum_topics")
          .update({ slug: finalSlug })
          .eq("id", data.id);

        data.slug = finalSlug;
      }

      // Načteme tagy pro téma
      if (data) {
        const { data: topicTags } = await supabase
          .from("forum_topic_tags")
          .select("forum_tags!inner(slug)")
          .eq("topic_id", data.id);

        if (topicTags) {
          data.tags = topicTags.map((tt: any) => tt.forum_tags.slug);
          // Pro zpětnou kompatibilitu
          if (!data.tag && data.tags.length > 0) {
            data.tag = data.tags[0];
          }
        } else {
          data.tags = [];
        }
      }

      topic.value = data;

      // Načtení odpovědí k tématu
      if (data) {
        await fetchReplies(data.id);
        await fetchTopicUserVotes(data.id);
      }

      return data;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error fetching topic:", err);
      // Nastavíme topic na null pouze pokud došlo k chybě (téma neexistuje)
      topic.value = null;
      throw err;
    } finally {
      topicLoading.value = false;
    }
  };

  // Načtení odpovědí k tématu
  const fetchReplies = async (topicId: string) => {
    try {
      const { data, error: err } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: true });

      if (err) throw err;

      // Pro každou odpověď načteme počet liků
      if (data && data.length > 0) {
        for (const reply of data) {
          const { count: likeCount } = await supabase
            .from("forum_reply_likes")
            .select("*", { count: "exact", head: true })
            .eq("reply_id", reply.id);

          reply.like_count = likeCount || 0;
        }
      }

      replies.value = data || [];

      // Načteme uživatelské hlasy pro odpovědi
      if (data && data.length > 0) {
        await fetchReplyUserVotes(data.map((r: any) => r.id));
      }
    } catch (err) {
      console.error("Error fetching replies:", err);
      throw err;
    }
  };

  // Načtení uživatelských liků a disliků pro téma
  const fetchTopicUserVotes = async (topicId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        topicUserLikes.value = [];
        topicUserDislikes.value = [];
        return;
      }

      const { data: likes } = await supabase
        .from("forum_topic_likes")
        .select("topic_id")
        .eq("topic_id", topicId)
        .eq("user_email", user.user.email)
        .maybeSingle();

      const { data: dislikes } = await supabase
        .from("forum_topic_dislikes")
        .select("topic_id")
        .eq("topic_id", topicId)
        .eq("user_email", user.user.email)
        .maybeSingle();

      // Kontrolujeme, zda objekt má hodnotu topic_id a zda se shoduje s dotazovaným topicId
      topicUserLikes.value = likes && likes.topic_id === topicId ? [topicId] : [];
      topicUserDislikes.value = dislikes && dislikes.topic_id === topicId ? [topicId] : [];
    } catch (err) {
      console.error("Error fetching topic user votes:", err);
    }
  };

  // Načtení uživatelských liků a disliků pro odpovědi
  const fetchReplyUserVotes = async (replyIds: string[]) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email || replyIds.length === 0) {
        replyUserLikes.value = [];
        replyUserDislikes.value = [];
        return;
      }

      const { data: likes } = await supabase
        .from("forum_reply_likes")
        .select("reply_id")
        .in("reply_id", replyIds)
        .eq("user_email", user.user.email);

      const { data: dislikes } = await supabase
        .from("forum_reply_dislikes")
        .select("reply_id")
        .in("reply_id", replyIds)
        .eq("user_email", user.user.email);

      replyUserLikes.value = likes?.map((l: any) => l.reply_id) || [];
      replyUserDislikes.value = dislikes?.map((d: any) => d.reply_id) || [];
    } catch (err) {
      console.error("Error fetching reply user votes:", err);
    }
  };

  // Vytvoření tématu
  const createTopic = async (topicData: {
    title: string;
    content: string;
    category: "general" | "announcement" | "help";
    tag?: string; // Deprecated, use tags instead
    tags?: string[]; // Array of tag slugs
    author_email: string;
    author_name: string;
  }) => {
    try {
      loading.value = true;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      // Vygenerujeme slug z názvu
      let slug = slugify(topicData.title);

      // Zkontrolujeme, zda slug už neexistuje
      const { data: existing } = await supabase
        .from("forum_topics")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existing) {
        // Pokud slug existuje, přidáme timestamp
        slug = `${slug}-${Date.now().toString().slice(-8)}`;
      }

      // Extrahujeme tagy a odstraníme je z topicData
      const tags = topicData.tags || (topicData.tag ? [topicData.tag] : []);
      const { tags: _, tag: __, ...topicDataWithoutTags } = topicData;

      const { data, error: err } = await supabase
        .from("forum_topics")
        .insert([
          {
            ...topicDataWithoutTags,
            slug,
            author_email: user.user.email,
          },
        ])
        .select()
        .single();

      if (err) throw err;

      // Vytvoříme vztahy mezi tématem a tagy
      if (tags.length > 0 && data.id) {
        // Získáme ID tagů podle jejich slug
        const { data: tagRecords } = await supabase
          .from("forum_tags")
          .select("id, slug")
          .in("slug", tags);

        if (tagRecords && tagRecords.length > 0) {
          const tagIds = tagRecords.map((t) => t.id);
          const topicTagRelations = tagIds.map((tagId) => ({
            topic_id: data.id,
            tag_id: tagId,
          }));

          const { error: tagsErr } = await supabase
            .from("forum_topic_tags")
            .insert(topicTagRelations);

          if (tagsErr) {
            console.error("Error creating topic-tag relations:", tagsErr);
            // Pokračujeme i když selže vytvoření vztahů
          }
        }
      }

      await fetchTopics();
      return data;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error creating topic:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Aktualizace tématu
  const updateTopic = async (
    id: string,
    topicData: Partial<ForumTopic>
  ) => {
    try {
      loading.value = true;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      // Pokud se změnil název, aktualizujeme slug
      if (topicData.title) {
        let slug = slugify(topicData.title);

        // Zkontrolujeme, zda slug už neexistuje (kromě aktuálního tématu)
        const { data: existing } = await supabase
          .from("forum_topics")
          .select("id")
          .eq("slug", slug)
          .neq("id", id)
          .single();

        if (existing) {
          // Pokud slug existuje, přidáme část id
          slug = `${slug}-${id.substring(0, 8)}`;
        }

        topicData.slug = slug;
      }

      // Extrahujeme tagy a zpracujeme je zvlášť
      const tags = topicData.tags || (topicData.tag ? [topicData.tag] : undefined);
      const { tags: _, tag: __, ...topicDataWithoutTags } = topicData;

      const { data, error: err } = await supabase
        .from("forum_topics")
        .update(topicDataWithoutTags)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      // Aktualizujeme tagy pokud byly poskytnuty
      if (tags !== undefined && data.id) {
        // Smazat všechny existující vztahy
        await supabase.from("forum_topic_tags").delete().eq("topic_id", data.id);

        // Vytvořit nové vztahy
        if (tags.length > 0) {
          // Získáme ID tagů podle jejich slug
          const { data: tagRecords } = await supabase
            .from("forum_tags")
            .select("id, slug")
            .in("slug", tags);

          if (tagRecords && tagRecords.length > 0) {
            const tagIds = tagRecords.map((t) => t.id);
            const topicTagRelations = tagIds.map((tagId) => ({
              topic_id: data.id,
              tag_id: tagId,
            }));

            const { error: tagsErr } = await supabase
              .from("forum_topic_tags")
              .insert(topicTagRelations);

            if (tagsErr) {
              console.error("Error updating topic-tag relations:", tagsErr);
            }
          }
        }

        // Aktualizujeme data o tagy
        data.tags = tags;
      }

      await fetchTopics();
      if (topic.value?.id === id) {
        topic.value = data;
      }
      return data;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error updating topic:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Smazání tématu
  const deleteTopic = async (id: string) => {
    try {
      loading.value = true;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { error: err } = await supabase
        .from("forum_topics")
        .delete()
        .eq("id", id);

      if (err) throw err;

      await fetchTopics();
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error deleting topic:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Archivace tématu
  const archiveTopic = async (id: string) => {
    return updateTopic(id, { status: "archived" });
  };

  // Odarchivace tématu
  const unarchiveTopic = async (id: string) => {
    return updateTopic(id, { status: "active" });
  };

  // Zablokování/odemčení tématu
  const toggleLockTopic = async (id: string, isLocked: boolean) => {
    return updateTopic(id, { is_locked: isLocked });
  };

  // Připnutí/odepnutí tématu
  const togglePinTopic = async (id: string, isPinned: boolean) => {
    return updateTopic(id, { is_pinned: isPinned });
  };

  // Vytvoření odpovědi
  const createReply = async (
    topicId: string,
    replyData: {
      content: string;
      author_email: string;
      author_name: string;
      parent_reply_id?: string | null;
    }
  ) => {
    try {
      loading.value = true;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { data, error: err } = await supabase
        .from("forum_replies")
        .insert([
          {
            ...replyData,
            topic_id: topicId,
            parent_reply_id: replyData.parent_reply_id || null,
            author_email: user.user.email,
          },
        ])
        .select()
        .single();

      if (err) throw err;

      // Přidáme novou odpověď do replies a načteme like_count
      const { count: likeCount } = await supabase
        .from("forum_reply_likes")
        .select("*", { count: "exact", head: true })
        .eq("reply_id", data.id);

      const newReply = { ...data, like_count: likeCount || 0 };
      replies.value.push(newReply);

      // Načteme uživatelské hlasy pro novou odpověď
      if (replies.value.length > 0) {
        await fetchReplyUserVotes([data.id]);
      }

      // Aktualizujeme reply_count v topic ref, pokud existuje
      if (topic.value && topic.value.id === topicId) {
        topic.value.reply_count = replies.value.length;
      }

      return data;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error creating reply:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Aktualizace odpovědi
  const updateReply = async (id: string, replyData: Partial<ForumReply>) => {
    try {
      loading.value = true;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { data, error: err } = await supabase
        .from("forum_replies")
        .update(replyData)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      if (data.topic_id) {
        await fetchReplies(data.topic_id);
      }
      return data;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error updating reply:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Smazání odpovědi
  const deleteReply = async (id: string) => {
    try {
      loading.value = true;

      // Nejdřív získáme topic_id z odpovědi
      const { data: reply } = await supabase
        .from("forum_replies")
        .select("topic_id")
        .eq("id", id)
        .single();

      const { error: err } = await supabase
        .from("forum_replies")
        .delete()
        .eq("id", id);

      if (err) throw err;

      // Odstraníme odpověď z replies array
      replies.value = replies.value.filter((r) => r.id !== id);

      // Aktualizujeme reply_count v topic ref, pokud existuje
      if (reply?.topic_id && topic.value && topic.value.id === reply.topic_id) {
        topic.value.reply_count = replies.value.length;
      }
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error deleting reply:", err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // Označení odpovědi jako nejlepší odpověď
  const setBestAnswer = async (replyId: string, topicId: string) => {
    try {
      // Nejdřív zrušíme všechny ostatní nejlepší odpovědi v tématu
      await supabase
        .from("forum_replies")
        .update({ is_best_answer: false })
        .eq("topic_id", topicId);

      // Pak nastavíme novou nejlepší odpověď
      await updateReply(replyId, { is_best_answer: true });
      await fetchReplies(topicId);
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error setting best answer:", err);
      throw err;
    }
  };

  // Přidání like k tématu
  const likeTopic = async (topicId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      // Nejdřív odstraníme dislike, pokud existuje
      await supabase
        .from("forum_topic_dislikes")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_email", user.user.email);

      const { error: err } = await supabase.from("forum_topic_likes").insert({
        topic_id: topicId,
        user_email: user.user.email,
      });

      if (err) throw err;
      await fetchTopicUserVotes(topicId);
    } catch (err) {
      console.error("Error liking topic:", err);
      throw err;
    }
  };

  // Odstranění like z tématu
  const unlikeTopic = async (topicId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { error: err } = await supabase
        .from("forum_topic_likes")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_email", user.user.email);

      if (err) throw err;
      await fetchTopicUserVotes(topicId);
    } catch (err) {
      console.error("Error unliking topic:", err);
      throw err;
    }
  };

  // Přidání dislike k tématu
  const dislikeTopic = async (topicId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      // Nejdřív odstraníme like, pokud existuje
      await supabase
        .from("forum_topic_likes")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_email", user.user.email);

      const { error: err } = await supabase.from("forum_topic_dislikes").insert({
        topic_id: topicId,
        user_email: user.user.email,
      });

      if (err) throw err;
      await fetchTopicUserVotes(topicId);
    } catch (err) {
      console.error("Error disliking topic:", err);
      throw err;
    }
  };

  // Odstranění dislike z tématu
  const undislikeTopic = async (topicId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { error: err } = await supabase
        .from("forum_topic_dislikes")
        .delete()
        .eq("topic_id", topicId)
        .eq("user_email", user.user.email);

      if (err) throw err;
      await fetchTopicUserVotes(topicId);
    } catch (err) {
      console.error("Error undisliking topic:", err);
      throw err;
    }
  };

  // Přidání like k odpovědi
  const likeReply = async (replyId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      // Nejdřív odstraníme dislike, pokud existuje
      await supabase
        .from("forum_reply_dislikes")
        .delete()
        .eq("reply_id", replyId)
        .eq("user_email", user.user.email);

      const { error: err } = await supabase.from("forum_reply_likes").insert({
        reply_id: replyId,
        user_email: user.user.email,
      });

      if (err) throw err;

      // Načteme znovu odpovědi pro aktualizaci
      const reply = replies.value.find((r) => r.id === replyId);
      if (reply) {
        await fetchReplies(reply.topic_id);
      }
    } catch (err) {
      console.error("Error liking reply:", err);
      throw err;
    }
  };

  // Odstranění like z odpovědi
  const unlikeReply = async (replyId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { error: err } = await supabase
        .from("forum_reply_likes")
        .delete()
        .eq("reply_id", replyId)
        .eq("user_email", user.user.email);

      if (err) throw err;

      // Načteme znovu odpovědi pro aktualizaci
      const reply = replies.value.find((r) => r.id === replyId);
      if (reply) {
        await fetchReplies(reply.topic_id);
      }
    } catch (err) {
      console.error("Error unliking reply:", err);
      throw err;
    }
  };

  // Přidání dislike k odpovědi
  const dislikeReply = async (replyId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      // Nejdřív odstraníme like, pokud existuje
      await supabase
        .from("forum_reply_likes")
        .delete()
        .eq("reply_id", replyId)
        .eq("user_email", user.user.email);

      const { error: err } = await supabase.from("forum_reply_dislikes").insert({
        reply_id: replyId,
        user_email: user.user.email,
      });

      if (err) throw err;

      // Načteme znovu odpovědi pro aktualizaci
      const reply = replies.value.find((r) => r.id === replyId);
      if (reply) {
        await fetchReplies(reply.topic_id);
      }
    } catch (err) {
      console.error("Error disliking reply:", err);
      throw err;
    }
  };

  // Odstranění dislike z odpovědi
  const undislikeReply = async (replyId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { error: err } = await supabase
        .from("forum_reply_dislikes")
        .delete()
        .eq("reply_id", replyId)
        .eq("user_email", user.user.email);

      if (err) throw err;

      // Načteme znovu odpovědi pro aktualizaci
      const reply = replies.value.find((r) => r.id === replyId);
      if (reply) {
        await fetchReplies(reply.topic_id);
      }
    } catch (err) {
      console.error("Error undisliking reply:", err);
      throw err;
    }
  };

  // Zvýšení počtu zhlédnutí a uložení záznamu (pouze jednou za session na uživatele)
  const incrementViewCount = async (topicId: string) => {
    try {
      if (typeof window === 'undefined') return;

      // Získání unikátního session ID pro tohoto uživatele
      const sessionId = getSessionId();
      if (!sessionId) return;

      const { data: user } = await supabase.auth.getUser();

      // Pro nepřihlášené uživatele použijeme session ID jako identifikátor
      const userEmail = user.user?.email || `anonymous_${sessionId}`;
      const userName = user.user?.email
        ? user.user.email.split("@")[0]
        : `Anonymní ${sessionId.substring(0, 8)}`;

      // Kontrola, zda už existuje záznam pro tuto kombinaci session_id, topic_id a user_email
      const { data: existingView } = await supabase
        .from("forum_topic_views")
        .select("id")
        .eq("topic_id", topicId)
        .eq("session_id", sessionId)
        .eq("viewed_by_email", userEmail)
        .maybeSingle();

      // Pokud už existuje záznam s tímto session ID, user_email a topic_id, neukládej znovu
      if (existingView) {
        return;
      }

      // Zvýšení počtu zhlédnutí (pouze pokud je uživatel přihlášen)
      if (user.user?.email) {
        // Kontrola, zda už byl dnes uložen záznam pro tohoto uživatele (bez ohledu na session)
        const today = new Date().toISOString().split("T")[0];
        const { data: todayView } = await supabase
          .from("forum_topic_views")
          .select("id")
          .eq("topic_id", topicId)
          .eq("viewed_by_email", user.user.email)
          .gte("viewed_at", `${today}T00:00:00`)
          .maybeSingle();

        // Pokud ještě dnes nebyl záznam pro tohoto uživatele, zvýšíme počet zhlédnutí
        if (!todayView) {
          await supabase.rpc("increment_topic_views", { topic_id: topicId });
        }
      }

      // Uložení záznamu o zhlédnutí
      await supabase.from("forum_topic_views").insert({
        topic_id: topicId,
        viewed_by_email: userEmail,
        viewed_by_name: userName,
        session_id: sessionId,
      });
    } catch (err) {
      console.error("Error incrementing view count:", err);
    }
  };

  // Načtení historie úprav tématu
  const fetchEditHistory = async (topicId: string) => {
    try {
      const { data, error: err } = await supabase
        .from("forum_topic_edit_history")
        .select("*")
        .eq("topic_id", topicId)
        .order("created_at", { ascending: false });

      if (err) throw err;
      editHistory.value = data || [];
    } catch (err) {
      console.error("Error fetching edit history:", err);
      throw err;
    }
  };

  // Načtení záznamů o zhlédnutí tématu
  const fetchViews = async (topicId: string, limit: number = 50) => {
    try {
      const { data, error: err } = await supabase
        .from("forum_topic_views")
        .select("*")
        .eq("topic_id", topicId)
        .order("viewed_at", { ascending: false })
        .limit(limit);

      if (err) throw err;
      views.value = data || [];
    } catch (err) {
      console.error("Error fetching views:", err);
      throw err;
    }
  };

  // Načtení všech kategorií
  const fetchCategories = async () => {
    try {
      const { data, error: err } = await supabase
        .from("forum_categories")
        .select("*")
        .order("name");

      if (err) throw err;
      categories.value = data || [];
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
    }
  };

  // Načtení všech tagů
  const fetchTags = async () => {
    try {
      const { data, error: err } = await supabase
        .from("forum_tags")
        .select("*")
        .order("name");

      if (err) throw err;
      tags.value = data || [];
    } catch (err) {
      console.error("Error fetching tags:", err);
      throw err;
    }
  };

  // Vytvoření nové kategorie
  const createCategory = async (name: string, color?: string) => {
    try {
      const slug = slugify(name);
      const { data, error: err } = await supabase
        .from("forum_categories")
        .insert([{ name, slug, color: color || "#6366f1" }])
        .select()
        .single();

      if (err) throw err;

      // Refresh categories
      await fetchCategories();

      return data;
    } catch (err) {
      console.error("Error creating category:", err);
      throw err;
    }
  };

  // Vytvoření nového tagu
  const createTag = async (name: string, color?: string) => {
    try {
      const slug = slugify(name);
      const { data, error: err } = await supabase
        .from("forum_tags")
        .insert([{ name, slug, color: color || "#6366f1" }])
        .select()
        .single();

      if (err) throw err;

      // Refresh tags
      await fetchTags();

      return data;
    } catch (err) {
      console.error("Error creating tag:", err);
      throw err;
    }
  };

  // Aktualizace kategorie
  const updateCategory = async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name;
        updateData.slug = slugify(updates.name);
      }
      if (updates.color !== undefined) {
        updateData.color = updates.color;
      }

      if (Object.keys(updateData).length === 0) {
        return null;
      }

      const { data, error: err } = await supabase
        .from("forum_categories")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      // Refresh categories
      await fetchCategories();

      return data;
    } catch (err) {
      console.error("Error updating category:", err);
      throw err;
    }
  };

  // Aktualizace tagu
  const updateTag = async (id: string, updates: { name?: string; color?: string }) => {
    try {
      const updateData: any = {};
      if (updates.name !== undefined) {
        updateData.name = updates.name;
        updateData.slug = slugify(updates.name);
      }
      if (updates.color !== undefined) {
        updateData.color = updates.color;
      }

      if (Object.keys(updateData).length === 0) {
        return null;
      }

      const { data, error: err } = await supabase
        .from("forum_tags")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

      // Refresh tags
      await fetchTags();

      return data;
    } catch (err) {
      console.error("Error updating tag:", err);
      throw err;
    }
  };

  // Smazání kategorie
  const deleteCategory = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("forum_categories")
        .delete()
        .eq("id", id);

      if (err) throw err;

      // Refresh categories
      await fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      throw err;
    }
  };

  // Smazání tagu
  const deleteTag = async (id: string) => {
    try {
      const { error: err } = await supabase
        .from("forum_tags")
        .delete()
        .eq("id", id);

      if (err) throw err;

      // Refresh tags
      await fetchTags();
    } catch (err) {
      console.error("Error deleting tag:", err);
      throw err;
    }
  };

  return {
    topics,
    topic,
    replies,
    editHistory,
    views,
    topicUserLikes,
    topicUserDislikes,
    replyUserLikes,
    replyUserDislikes,
    loading,
    topicLoading,
    error,
    categories,
    tags,
    fetchTopics,
    fetchTopic,
    fetchReplies,
    createTopic,
    updateTopic,
    deleteTopic,
    archiveTopic,
    unarchiveTopic,
    toggleLockTopic,
    togglePinTopic,
    createReply,
    updateReply,
    deleteReply,
    setBestAnswer,
    likeTopic,
    unlikeTopic,
    dislikeTopic,
    undislikeTopic,
    likeReply,
    unlikeReply,
    dislikeReply,
    undislikeReply,
    incrementViewCount,
    fetchEditHistory,
    fetchViews,
    fetchCategories,
    fetchTags,
    createCategory,
    createTag,
    updateCategory,
    updateTag,
    deleteCategory,
    deleteTag,
  };
};

