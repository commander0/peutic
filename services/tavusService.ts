
const TAVUS_API_URL = 'https://tavusapi.com/v2';
const API_KEY = 'ae15b9c744264844a555049b576094d8';

export interface TavusConversationResponse {
  conversation_id: string;
  conversation_url: string;
  status: string;
}

export const createTavusConversation = async (replicaId: string, userName: string): Promise<TavusConversationResponse> => {
  if (!API_KEY) {
    throw new Error("Configuration Error: Missing Tavus API Key");
  }

  const body = {
    replica_id: replicaId,
    conversation_name: `Session with ${userName} - ${new Date().toISOString()}`,
    conversational_context: `You are an empathetic, professional, and warm human specialist. You are speaking with ${userName}. Your role is to listen activey, provide emotional support, and help them process their thoughts. Keep your answers concise (2-3 sentences) to keep the conversation flowing naturally. Do not mention you are an AI.`,
    properties: {
      max_call_duration: 3600,
      enable_recording: true,
      enable_transcription: true
    }
  };

  try {
    const response = await fetch(`${TAVUS_API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || data.error || response.statusText;
      
      // Explicitly catch the credit error so the UI can gracefully switch modes
      if (response.status === 402 || errorMsg.includes('out of conversational credits') || errorMsg.includes('quota')) {
        throw new Error("Tavus Billing Error: The account is out of credits.");
      }

      if (response.status === 401) throw new Error("API Key Invalid or Unauthorized.");
      if (response.status === 403) throw new Error("Access Forbidden. Check API Key permissions.");
      
      throw new Error(errorMsg);
    }
    
    if (!data.conversation_url) {
      throw new Error("API returned success but no conversation URL was found.");
    }

    return {
      conversation_id: data.conversation_id,
      conversation_url: data.conversation_url,
      status: data.status || 'active'
    };

  } catch (error: any) {
    // Propagate specific billing errors without logging them as system failures
    if (error.message.includes("Tavus Billing Error")) {
        throw error;
    }
    if (error.message.includes("Failed to fetch")) {
        throw new Error("Network Error: This may be a CORS issue. In production, this API call should run on a backend server, not the browser.");
    }
    console.error("Tavus Service Exception:", error);
    throw error;
  }
};

export const listReplicas = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${TAVUS_API_URL}/replicas`, {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.data || []; // Assuming standard paginated response or array
  } catch (error) {
    console.warn("Failed to fetch real Tavus thumbnails (likely CORS). Using high-fidelity fallbacks.");
    return [];
  }
};
