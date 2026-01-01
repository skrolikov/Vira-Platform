import React, { useEffect, useRef, useState } from 'react';
import { Flex } from '../Flex';
import { Avatar } from '../Avatar';
import { Button } from '../Button';
import { Text } from '../Text';
import { Heading } from '../Heading';
import { Badge } from '../Badge';
import { Box } from '../Box';
import { MessageBubble, MessageBubbleProps } from './MessageBubble';
import { MessageInput, QuickReplyTemplate } from './MessageInput';
import './Chat.css';

export interface ChatWindowProps {
  chatId: string;
  chatTitle?: string;
  chatAvatar?: string;
  chatType: 'internal' | 'telegram' | 'whatsapp' | 'website' | 'order' | 'contact';
  messages: Omit<MessageBubbleProps, 'isOwn' | 'onReply' | 'onDelete'>[];
  currentUserId: string;
  onSendMessage: (content: string, attachments?: File[]) => void;
  onLoadMore?: () => void;
  onDeleteMessage?: (messageId: string) => void;
  templates?: QuickReplyTemplate[];
  loading?: boolean;
  hasMore?: boolean;
  typingUsers?: string[];
  onCreateContact?: () => void;
  showCreateContact?: boolean;
  orderNumber?: string;
  customerName?: string;
  onClose?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  chatTitle,
  chatAvatar,
  chatType,
  messages,
  currentUserId,
  onSendMessage,
  onLoadMore,
  onDeleteMessage,
  templates = [],
  loading = false,
  hasMore = false,
  typingUsers = [],
  onCreateContact,
  showCreateContact = false,
  orderNumber,
  customerName,
  onClose
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyTo, setReplyTo] = useState<{ id: string; content: string; senderName: string } | undefined>();
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Detect manual scroll
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isAtBottom);

    // Load more on scroll to top
    if (scrollTop === 0 && hasMore && onLoadMore && !loading) {
      onLoadMore();
    }
  };

  const handleReply = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyTo({
        id: message.id,
        content: message.content,
        senderName: message.senderName || 'Unknown'
      });
    }
  };

  const handleSend = (content: string, attachments?: File[]) => {
    onSendMessage(content, attachments);
    setReplyTo(undefined);
  };

  const getIntegrationBadge = () => {
    switch (chatType) {
      case 'telegram': return <Badge preset="primary">📱 Telegram</Badge>;
      case 'whatsapp': return <Badge preset="success">💬 WhatsApp</Badge>;
      case 'website': return <Badge preset="info">🌐 Сайт</Badge>;
      case 'order': return <Badge preset="warning">📦 Заказ</Badge>;
      case 'contact': return <Badge preset="info">👤 Контакт</Badge>;
      default: return null;
    }
  };

  return (
    <Flex 
      direction="column"
      design={{
        height: '100%',
        bg: 'color.bg.primary',
      }}
    >
      {/* Header */}
      <Box
        as="div"
        design={{
          padding: '16px 20px',
          borderBottom: '1px solid',
          borderColor: 'color.border.primary',
          bg: 'color.bg.primary',
          boxShadow: 'shadow.sm',
        }}
      >
        <Flex
          justify="space-between"
          align="center"
        >
          <Flex gap="md" align="center">
            <Avatar
              src={chatAvatar}
              alt={chatTitle || customerName || 'Chat'}
              size="md"
              initials={chatTitle?.[0] || customerName?.[0] || '?'}
            />
            <Flex direction="column" gap="xs">
              <Heading level={4} design={{ margin: 0, fontSize: '1.125rem', fontWeight: '700' }}>
                {chatTitle || customerName || 'Без названия'}
              </Heading>
              <Flex gap="xs" align="center">
                {getIntegrationBadge()}
                {orderNumber && (
                  <Badge preset="info">
                    📦 {orderNumber}
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Flex>

          <Flex gap="sm" align="center">
            {showCreateContact && onCreateContact && (
              <Button preset="primary" onClick={onCreateContact}>
                + Создать контакт
              </Button>
            )}
            {onClose && (
              <Button preset="ghost" onClick={onClose}>
                ✕
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* Messages */}
      <Box
        as="div"
        ref={messagesContainerRef}
        onScroll={handleScroll}
        design={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          bg: 'color.bg.secondary',
        }}
      >
        {/* Load more indicator */}
        {hasMore && (
          <Flex justify="center" design={{ padding: '16px 0' }}>
            {loading ? (
              <Text design={{ color: 'color.text.secondary' }}>Загрузка...</Text>
            ) : (
              <Button preset="ghost" onClick={onLoadMore}>
                Загрузить предыдущие
              </Button>
            )}
          </Flex>
        )}

        {/* Messages list */}
        {messages.length === 0 ? (
          <Flex 
            justify="center" 
            align="center" 
            direction="column"
            gap="md"
            design={{ flex: 1 }}
          >
            <Box
              as="div"
              design={{
                fontSize: '4rem',
                opacity: 0.5,
              }}
            >
              💬
            </Box>
            <Text design={{ color: 'color.text.secondary' }}>Нет сообщений</Text>
            <Text size="sm" design={{ color: 'color.text.secondary' }}>Начните разговор!</Text>
          </Flex>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              {...message}
              isOwn={(message as any).senderUserID === currentUserId}
              onReply={handleReply}
              onDelete={onDeleteMessage}
            />
          ))
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <Flex gap="sm" align="center" design={{ padding: '8px 0' }}>
            <Box
              as="div"
              design={{
                display: 'flex',
                gap: '4px',
                padding: '8px 12px',
              }}
            >
              <Box
                as="div"
                design={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  bg: '#9ca3af',
                  animation: 'typing 1.4s infinite',
                }}
              />
              <Box
                as="div"
                design={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  bg: '#9ca3af',
                  animation: 'typing 1.4s infinite 0.2s',
                }}
              />
              <Box
                as="div"
                design={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  bg: '#9ca3af',
                  animation: 'typing 1.4s infinite 0.4s',
                }}
              />
            </Box>
            <Text size="sm" design={{ color: 'color.text.secondary' }}>
              {typingUsers.join(', ')} печатает...
            </Text>
          </Flex>
        )}

        {/* Scroll anchor */}
        <Box as="div" ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box
        as="div"
        design={{
          padding: '16px 20px',
          borderTop: '1px solid',
          borderColor: 'color.border.primary',
          bg: 'color.bg.primary',
          boxShadow: 'shadow.sm',
        }}
      >
        <MessageInput
          onSend={handleSend}
          templates={templates}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(undefined)}
        />
      </Box>
    </Flex>
  );
};

