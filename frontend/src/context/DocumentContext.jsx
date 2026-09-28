import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  clearSession as apiClearSession,
  extractErrorMessage,
  sendChatMessage,
  uploadDocument,
} from "../api/client";

const DocumentContext = createContext(null);

const initialState = {
  status: "empty", // empty | processing | ready | error
  sessionId: null,
  filename: "",
  summary: "",
  risks: {},
  chatHistory: [],
  chunkCount: 0,
  wordCount: 0,
  error: "",
};

export function DocumentProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [chatPending, setChatPending] = useState(false);

  const upload = useCallback(async (file) => {
    setState((prev) => ({ ...prev, status: "processing", error: "" }));
    try {
      const data = await uploadDocument(file);
      setState({
        status: "ready",
        sessionId: data.session_id,
        filename: data.filename,
        summary: data.summary,
        risks: data.risks,
        chatHistory: [
          { role: "user", content: `Uploaded ${data.filename} for analysis` },
          { role: "assistant", content: data.summary },
        ],
        chunkCount: data.chunk_count,
        wordCount: data.word_count,
        error: "",
      });
    } catch (err) {
      setState((prev) => ({ ...prev, status: "error", error: extractErrorMessage(err) }));
    }
  }, []);

  const askQuestion = useCallback(
    async (message) => {
      if (!state.sessionId) return;
      setChatPending(true);
      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, { role: "user", content: message }],
      }));
      try {
        const data = await sendChatMessage(state.sessionId, message);
        setState((prev) => ({
          ...prev,
          chatHistory: [...prev.chatHistory, { role: "assistant", content: data.response }],
        }));
      } catch (err) {
        setState((prev) => ({
          ...prev,
          chatHistory: [
            ...prev.chatHistory,
            { role: "assistant", content: `⚠️ ${extractErrorMessage(err)}` },
          ],
        }));
      } finally {
        setChatPending(false);
      }
    },
    [state.sessionId]
  );

  const reset = useCallback(async () => {
    if (state.sessionId) {
      apiClearSession(state.sessionId).catch(() => {});
    }
    setState(initialState);
  }, [state.sessionId]);

  const value = useMemo(
    () => ({ ...state, chatPending, upload, askQuestion, reset }),
    [state, chatPending, upload, askQuestion, reset]
  );

  return <DocumentContext.Provider value={value}>{children}</DocumentContext.Provider>;
}

export function useDocument() {
  const ctx = useContext(DocumentContext);
  if (!ctx) throw new Error("useDocument must be used within a DocumentProvider");
  return ctx;
}
