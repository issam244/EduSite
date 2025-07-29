import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Send, Calculator } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@shared/schema';
import { renderMathStep, formatMathText } from '@/lib/mathRenderer';
import { useState } from 'react';

interface MessageListProps {
  onNewQuestion?: () => void;
}

export function MessageList({ onNewQuestion }: MessageListProps) {
  const { messages, sendMessage, isLoading } = useChat();
  const [quickInput, setQuickInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleQuickSubmit = async () => {
    if (!quickInput.trim()) return;
    
    await sendMessage(quickInput);
    setQuickInput('');
    onNewQuestion?.();
  };

  const formatTimestamp = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return d.toLocaleDateString('fr-FR');
  };

  const renderAIResponse = (message: Message) => {
    // Check if this message has an associated math solution
    const hasSteps = message.metadata && (message.metadata as any).steps;
    
    if (hasSteps) {
      return (
        <div className="prose prose-sm max-w-none">
          <p className="font-semibold text-dark-gray mb-3">Solution étape par étape :</p>
          
          <div className="space-y-3">
            {(message.metadata as any).steps.map((step: any, index: number) => {
              const renderedStep = renderMathStep(step, index);
              return (
                <div key={index} className={`${renderedStep.className} pl-4 py-2 mb-3`}>
                  <p className="font-medium">{renderedStep.title}</p>
                  <p 
                    className="text-sm text-medium-gray"
                    dangerouslySetInnerHTML={{ __html: formatMathText(step.description || step.explanation) }}
                  />
                  {renderedStep.math && (
                    <code className="block mt-2 bg-gray-100 p-2 rounded text-sm">
                      {renderedStep.math}
                    </code>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <p 
              className="font-bold text-amber-800"
              dangerouslySetInnerHTML={{ __html: formatMathText(message.content) }}
            />
          </div>
        </div>
      );
    }

    return (
      <div 
        className="prose prose-sm"
        dangerouslySetInnerHTML={{ __html: formatMathText(message.content) }}
      />
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-dark-gray">Conversation</h3>
        <Button variant="ghost" size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-medium-gray">
            <Calculator className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>Commencez par poser votre première question mathématique!</p>
          </div>
        ) : (
          messages.map((message: Message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'user' ? (
                // User Message
                <div className="bg-primary text-white rounded-2xl rounded-br-lg px-4 py-3 max-w-md">
                  <p>{message.content}</p>
                  <span className="text-xs opacity-75 block mt-1">
                    {formatTimestamp(message.createdAt)}
                  </span>
                </div>
              ) : (
                // AI Response
                <div className="bg-gray-100 rounded-2xl rounded-bl-lg px-4 py-3 max-w-2xl">
                  <div className="flex items-center mb-2">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full mr-2" />
                    <span className="font-medium text-dark-gray">MathTunis IA</span>
                  </div>
                  
                  {renderAIResponse(message)}
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                    <span className="text-xs text-medium-gray">
                      {message.metadata?.source === 'huggingface' && 'Généré par HuggingFace Transformers'}
                      {message.metadata?.source === 'webscraping' && 'Compilé depuis des sources web'}
                      {message.metadata?.source === 'manual' && 'Solution basique'}
                    </span>
                    {message.metadata?.confidence && (
                      <span className="text-xs text-medium-gray">
                        Confiance: {message.metadata.confidence}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-lg px-4 py-3">
              <div className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-primary to-accent rounded-full mr-2" />
                <span className="font-medium text-dark-gray">MathTunis IA</span>
              </div>
              <div className="flex items-center mt-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                </div>
                <span className="ml-2 text-sm text-medium-gray">
                  Résolution en cours...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Input */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Posez une autre question..."
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleQuickSubmit();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleQuickSubmit}
            disabled={!quickInput.trim() || isLoading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
