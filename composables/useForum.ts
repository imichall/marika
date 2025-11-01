import { ref, onMounted } from "vue";
import { useSupabaseClient } from "#imports";

export interface ForumTopic {
  id: string;
  title: string;
  content: string;
  category: "general" | "announcement" | "help";
  tag: "general" | "bug" | "issue" | "uprava";
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

export const useForum = () => {
  const supabase = useSupabaseClient();
  const topics = ref<ForumTopic[]>([]);
  const topic = ref<ForumTopic | null>(null);
  const replies = ref<ForumReply[]>([]);
  const editHistory = ref<ForumTopicEditHistory[]>([]);
  const views = ref<ForumTopicView[]>([]);
  const loading = ref(false);
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
        query = query.eq("status", filters.status);
      }
      if (filters?.is_pinned !== undefined) {
        query = query.eq("is_pinned", filters.is_pinned);
      }
      if (filters?.tag) {
        query = query.eq("tag", filters.tag);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      topics.value = data || [];
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error fetching topics:", err);
    } finally {
      loading.value = false;
    }
  };

  // Načtení jednoho tématu
  const fetchTopic = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await supabase
        .from("forum_topics")
        .select("*")
        .eq("id", id)
        .single();

      if (err) throw err;
      topic.value = data;

      // Načtení odpovědí k tématu
      if (data) {
        await fetchReplies(id);
      }

      return data;
    } catch (err) {
      error.value = (err as Error).message;
      console.error("Error fetching topic:", err);
      throw err;
    } finally {
      loading.value = false;
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
      replies.value = data || [];
    } catch (err) {
      console.error("Error fetching replies:", err);
      throw err;
    }
  };

  // Vytvoření tématu
  const createTopic = async (topicData: {
    title: string;
    content: string;
    category: "general" | "announcement" | "help";
    tag?: "general" | "bug" | "issue" | "uprava";
    author_email: string;
    author_name: string;
  }) => {
    try {
      loading.value = true;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { data, error: err } = await supabase
        .from("forum_topics")
        .insert([
          {
            ...topicData,
            author_email: user.user.email,
          },
        ])
        .select()
        .single();

      if (err) throw err;

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

      const { data, error: err } = await supabase
        .from("forum_topics")
        .update(topicData)
        .eq("id", id)
        .select()
        .single();

      if (err) throw err;

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
            author_email: user.user.email,
          },
        ])
        .select()
        .single();

      if (err) throw err;

      await fetchReplies(topicId);
      await fetchTopic(topicId); // Aktualizace reply_count
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

      if (reply?.topic_id) {
        await fetchReplies(reply.topic_id);
        await fetchTopic(reply.topic_id); // Aktualizace reply_count
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

      const { error: err } = await supabase.from("forum_topic_likes").insert({
        topic_id: topicId,
        user_email: user.user.email,
      });

      if (err) throw err;
      await fetchTopic(topicId);
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
      await fetchTopic(topicId);
    } catch (err) {
      console.error("Error unliking topic:", err);
      throw err;
    }
  };

  // Přidání like k odpovědi
  const likeReply = async (replyId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) throw new Error("User not authenticated");

      const { error: err } = await supabase.from("forum_reply_likes").insert({
        reply_id: replyId,
        user_email: user.user.email,
      });

      if (err) throw err;

      // Načteme znovu odpovědi pro aktualizaci like_count
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

      // Načteme znovu odpovědi pro aktualizaci like_count
      const reply = replies.value.find((r) => r.id === replyId);
      if (reply) {
        await fetchReplies(reply.topic_id);
      }
    } catch (err) {
      console.error("Error unliking reply:", err);
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

  return {
    topics,
    topic,
    replies,
    editHistory,
    views,
    loading,
    error,
    fetchTopics,
    fetchTopic,
    fetchReplies,
    createTopic,
    updateTopic,
    deleteTopic,
    archiveTopic,
    toggleLockTopic,
    togglePinTopic,
    createReply,
    updateReply,
    deleteReply,
    setBestAnswer,
    likeTopic,
    unlikeTopic,
    likeReply,
    unlikeReply,
    incrementViewCount,
    fetchEditHistory,
    fetchViews,
  };
};

