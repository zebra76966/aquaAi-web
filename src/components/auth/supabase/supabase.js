import { createClient } from "@supabase/supabase-js";
import { baseUrl } from "../config";

const SUPABASE_URL = "https://kfcnaeotwzfnluxkmefj.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmY25hZW90d3pmbmx1eGttZWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODIxODksImV4cCI6MjA4MDg1ODE4OX0.0fBwySg9ab0O6ye8O64EfeXxOruBc47iVCK_y_oaYLI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const fetchAndSetRealtimeAuth = async (djangoAuthToken) => {
  console.log("DJANGO", djangoAuthToken);
  try {
    const res = await fetch(`${baseUrl}/messenger/realtime-token/`, {
      headers: {
        Authorization: `Bearer ${djangoAuthToken}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch Supabase realtime token:", res.status);
      return false;
    }

    const data = await res.json();

    const token = data?.supabase_token || data?.token;

    if (!token) {
      console.error("No supabase token received");
      return false;
    }

    supabase.realtime.setAuth(token);

    console.log("Supabase Realtime authenticated ✅");
    return true;
  } catch (error) {
    console.error("Realtime auth error:", error);
    return false;
  }
};
