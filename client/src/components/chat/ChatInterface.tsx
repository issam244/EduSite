import { useEffect } from 'react';
import { InputModes } from './InputModes';
import { MessageList } from './MessageList';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';

export function ChatInterface() {
  const { createConversation, currentConversationId } = useChat();
  const { appUser } = useAuth();

  useEffect(() => {
    // Create a conversation if user is logged in and doesn't have one
    if (appUser && !currentConversationId) {
      createConversation();
    }
  }, [appUser, currentConversationId, createConversation]);

  const handleQuestionSubmit = () => {
    // This could trigger any additional actions after a question is submitted
    // For example, updating user stats, sending analytics, etc.
  };

  return (
    <div className="space-y-6">
      <InputModes onQuestionSubmit={handleQuestionSubmit} />
      <MessageList onNewQuestion={handleQuestionSubmit} />
    </div>
  );
}
