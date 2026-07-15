'use client';
import { useState, useEffect, useRef } from 'react';
import { getChats, getConversation, sendMessage, getSuggestions, startChat } from '@/utils/api';

export default function MessagesPage() {
  const [chats, setChats] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [myProfile, setMyProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const pollingRef = useRef(null);

  // Fetch inbox and suggestions on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [chatsRes, suggestionsRes] = await Promise.all([
          getChats(),
          getSuggestions(),
        ]);
        if (chatsRes.ok) {
          const data = await chatsRes.json();
          const arr = Array.isArray(data) ? data : data.results || [];
          setChats(arr);
        }
        if (suggestionsRes.ok) {
          const data = await suggestionsRes.json();
          setSuggestions(Array.isArray(data) ? data : data.results || []);
        }
      } finally {
        setLoadingChats(false);
      }
    };
    load();
  }, []);

  // Fetch & poll messages for active chat
  useEffect(() => {
    if (!activeChatId) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await getConversation(activeChatId);
        if (res.ok) setMessages(await res.json());
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Poll every 5 seconds for new messages
    pollingRef.current = setInterval(fetchMessages, 5000);
    return () => clearInterval(pollingRef.current);
  }, [activeChatId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleOpenChat = (chat) => {
    setActiveChatId(chat.id);
    setActiveChat(chat);
    setMessages([]);
  };

  const handleStartChat = async (profile) => {
    try {
      const res = await startChat(profile.id);
      if (res.ok) {
        const chat = await res.json();
        // Add to inbox if not already there
        setChats(prev => prev.some(c => c.id === chat.id) ? prev : [chat, ...prev]);
        handleOpenChat(chat);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = newMessage.trim();
    if (!text || !activeChatId) return;

    setNewMessage('');
    // Optimistic message (no user info needed for display)
    const optimistic = { id: `opt-${Date.now()}`, message: text, time: new Date().toISOString(), _optimistic: true };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await sendMessage(activeChatId, text);
      if (!res.ok) {
        // Revert optimistic if failed
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
    }
  };

  // Determine the "other user" in the chat to display
  const getChatPartner = (chat) => {
    // We don't have myProfile id easily here; show both
    return chat.user2 || chat.user1;
  };

  const getPartnerName = (partner) => {
    return partner?.user?.username || partner?.name || 'User';
  };

  const getPartnerAvatar = (partner) => {
    const name = getPartnerName(partner);
    return partner?.profile_picture || `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  return (
    <div style={{ height: 'calc(100vh - 70px)', display: 'flex', marginTop: '70px' }}>
      {/* Left Sidebar - Inbox */}
      <div style={{
        width: '360px',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Messages</h2>
        </div>

        {/* Suggestions to message */}
        {suggestions.length > 0 && (
          <div style={{ padding: '16px 0 8px' }}>
            <p style={{ padding: '0 24px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Suggested
            </p>
            <div style={{ display: 'flex', gap: '16px', padding: '0 24px', overflowX: 'auto', paddingBottom: '12px' }}>
              {suggestions.map(profile => (
                <button
                  key={profile.id}
                  onClick={() => handleStartChat(profile)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', background: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' }}
                >
                  <img
                    src={getPartnerAvatar(profile)}
                    alt={getPartnerName(profile)}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${getPartnerName(profile)}`; }}
                  />
                  <span style={{ fontSize: '12px', color: 'var(--text-color)', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getPartnerName(profile)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inbox List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingChats ? (
            <div style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</div>
          ) : chats.length === 0 ? (
            <div style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              No conversations yet. Click a suggestion above to start one!
            </div>
          ) : (
            chats.map(chat => {
              const partner = getChatPartner(chat);
              const partnerName = getPartnerName(partner);
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => handleOpenChat(chat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    width: '100%',
                    padding: '12px 24px',
                    background: isActive ? 'var(--surface-color)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderLeft: isActive ? '3px solid var(--accent-color)' : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <img
                    src={getPartnerAvatar(partner)}
                    alt={partnerName}
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${partnerName}`; }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', margin: 0, color: 'var(--text-color)' }}>{partnerName}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                      {new Date(chat.created).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right Panel - Conversation */}
      {activeChatId && activeChat ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(() => {
              const partner = getChatPartner(activeChat);
              const name = getPartnerName(partner);
              return (
                <>
                  <img
                    src={getPartnerAvatar(partner)}
                    alt={name}
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${name}`; }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{name}</span>
                </>
              );
            })()}
          </div>

          {/* Messages Thread */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loadingMessages && messages.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center' }}>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                No messages yet. Say hello! 👋
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isMine = msg._optimistic || false; // optimistic messages are always mine
                // Otherwise try to determine from sender; for now show aligned differently
                return (
                  <div
                    key={msg.id || idx}
                    style={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        background: isMine ? 'var(--accent-color)' : 'var(--surface-color)',
                        color: isMine ? '#fff' : 'var(--text-color)',
                        padding: '10px 16px',
                        borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        maxWidth: '60%',
                        fontSize: '14px',
                        opacity: msg._optimistic ? 0.7 : 1,
                      }}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 24px',
            borderTop: '1px solid var(--border-color)',
          }}>
            <input
              type="text"
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                border: '1px solid var(--border-color)',
                borderRadius: '22px',
                padding: '10px 18px',
                background: 'transparent',
                color: 'var(--text-color)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              style={{
                background: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: newMessage.trim() ? 'pointer' : 'default',
                opacity: newMessage.trim() ? 1 : 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.4 }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px', color: 'var(--text-color)' }}>Your Messages</h3>
          <p style={{ marginTop: '8px', fontSize: '14px' }}>Select a conversation or start a new one.</p>
        </div>
      )}
    </div>
  );
}
