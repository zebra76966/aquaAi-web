import { supabase } from "./supabase";

export const subscribeToConversation = (conversationId, onNewMessage, onUpdate) => {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messaging_message",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log("Realtime new message", payload.new);
        onNewMessage(payload.new);
      },
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messaging_message",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        console.log("Realtime message updated", payload.new);
        onUpdate(payload.new);
      },
    )
    .subscribe((status) => {
      console.log("Realtime status:", status);
    });

  return () => supabase.removeChannel(channel);
};

export const subscribeToConversationList = (userId, onConversationUpdate) => {
  const channel = supabase
    .channel(`user-conversations:${userId}`)

    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messaging_conversation",
        filter: `participant_1_id=eq.${userId}`,
      },
      (payload) => onConversationUpdate(payload.new),
    )

    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "messaging_conversation",
        filter: `participant_2_id=eq.${userId}`,
      },
      (payload) => onConversationUpdate(payload.new),
    )

    .subscribe();

  return () => supabase.removeChannel(channel);
};

export const useTypingPresence = (conversationId, currentUser, onPresenceChange) => {
  const channel = supabase.channel(`typing:${conversationId}`, {
    config: { presence: { key: currentUser.id } },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();

      const typing = Object.values(state)
        .flat()
        .filter((p) => p.isTyping && p.userId !== currentUser.id)
        .map((p) => ({ id: p.userId, name: p.userName }));

      onPresenceChange({ typing });
    })

    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          userId: currentUser.id,
          userName: currentUser.name,
          isTyping: false,
        });
      }
    });

  let timer = null;

  const setTyping = async (isTyping) => {
    await channel.track({
      userId: currentUser.id,
      userName: currentUser.name,
      isTyping,
    });

    if (isTyping) {
      clearTimeout(timer);
      timer = setTimeout(() => setTyping(false), 3000);
    }
  };

  const unsubscribe = () => {
    clearTimeout(timer);
    supabase.removeChannel(channel);
  };

  return { setTyping, unsubscribe };
};
