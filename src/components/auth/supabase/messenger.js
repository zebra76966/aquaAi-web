import { baseUrl } from "../../../../config";

export const startConversation = async (userId, message, token) => {
  const res = await fetch(`${baseUrl}/messenger/conversations/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_id: userId,
      initial_message: message,
    }),
  });

  const data = await res.json();
  console.log("datas", data);
  console.log("Start conversation response", data);

  if (!res.ok) {
    throw new Error(data?.detail || "Failed to start conversation");
  }

  return data;
};

export const getMyConversations = async (token) => {
  const res = await fetch(`${baseUrl}/messenger/conversations/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return data;
};

export const getConversationMessages = async (conversationId, token) => {
  const res = await fetch(`${baseUrl}/messenger/conversations/${conversationId}/messages/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  return data;
};

export const sendMessage = async (conversationId, content, token) => {
  const res = await fetch(`${baseUrl}/messenger/conversations/${conversationId}/messages/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
    }),
  });

  const data = await res.json();
  console.log("Send message response", data);

  return data;
};

export const markConversationRead = async (conversationId, token) => {
  try {
    await fetch(`${baseUrl}/messenger/conversations/${conversationId}/read/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (err) {
    console.log("Mark read error", err);
  }
};
