import React, { useMemo } from 'react';
import { Flex } from '../Flex';
import { Avatar } from '../Avatar';
import { Badge } from '../Badge';
import { Input } from '../Input';
import { Heading } from '../Heading';
import { Text } from '../Text';
import { Box } from '../Box';
import './Chat.css';

export interface ChatListItem {
  id: string;
  type: 'internal' | 'telegram' | 'whatsapp' | 'website' | 'order' | 'contact';
  title?: string;
  lastMessageText?: string;
  lastMessageAt?: Date;
  unreadCount: number;
  avatar?: string;
  status: 'active' | 'archived' | 'closed';
  customerName?: string;
  orderNumber?: string;
  integrationIcon?: string;
}

interface ChatListProps {
  chats: ChatListItem[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

const getIntegrationIcon = (type: string): string => {
  switch (type) {
    case 'telegram': return '📱';
    case 'whatsapp': return '💬';
    case 'website': return '🌐';
    case 'order': return '📦';
    case 'contact': return '👤';
    default: return '💭';
  }
};

const formatTime = (date?: Date): string => {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes}м`;
  if (hours < 24) return `${hours}ч`;
  if (days < 7) return `${days}д`;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
};

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  searchValue = '',
  onSearchChange,
  loading = false,
  emptyMessage = 'Нет чатов'
}) => {
  const filteredChats = useMemo(() => {
    if (!searchValue) return chats;
    const query = searchValue.toLowerCase();
    return chats.filter(chat => 
      chat.title?.toLowerCase().includes(query) ||
      chat.customerName?.toLowerCase().includes(query) ||
      chat.orderNumber?.toLowerCase().includes(query) ||
      chat.lastMessageText?.toLowerCase().includes(query)
    );
  }, [chats, searchValue]);

  return (
    <Flex 
      direction="column" 
      gap="0"
      design={{
        height: '100%',
        bg: 'color.bg.primary',
        borderRight: '1px solid',
        borderColor: 'color.border.primary',
      }}
    >
      {/* Header */}
      <Box
        as="div"
        design={{
          padding: 3,
          borderBottom: '1px solid',
          borderColor: 'color.border.primary',
          bg: 'color.bg.primary',
        }}
      >
        <Heading 
          level={3} 
          design={{ 
            margin: 0, 
            marginBottom: 2,
            fontSize: '1.125rem',
            fontWeight: '700',
          }}
        >
          Чаты
        </Heading>
        {onSearchChange && (
          <Input
            placeholder="Поиск чатов..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            prefix="🔍"
            design={{ width: '100%' }}
          />
        )}
      </Box>

      {/* Chat List */}
      <Flex 
        direction="column" 
        gap="0"
        design={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {loading ? (
          <Flex 
            justify="center" 
            align="center" 
            design={{ padding: 8 }}
          >
            <Text design={{ color: 'color.text.secondary' }}>Загрузка...</Text>
          </Flex>
        ) : filteredChats.length === 0 ? (
          <Flex 
            justify="center" 
            align="center" 
            design={{ padding: 8 }}
          >
            <Text design={{ color: 'color.text.secondary' }}>{emptyMessage}</Text>
          </Flex>
        ) : (
          filteredChats.map(chat => (
            <Box
              key={chat.id}
              as="button"
              onClick={() => onSelectChat(chat.id)}
              design={{
                padding: '14px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid',
                borderColor: 'color.border.secondary',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                bg: selectedChatId === chat.id ? 'color.bg.tertiary' : 'transparent',
                borderLeft: selectedChatId === chat.id ? '4px solid' : 'none',
                borderLeftColor: selectedChatId === chat.id ? 'color.primary' : 'transparent',
                paddingLeft: selectedChatId === chat.id ? '12px' : '16px',
                textAlign: 'left',
                width: '100%',
                border: 'none',
                hover: {
                  bg: selectedChatId === chat.id ? 'color.bg.tertiary' : 'color.bg.hover',
                },
              }}
            >
              <Flex gap="md" align="flex-start">
                {/* Avatar */}
                <Box
                  as="div"
                  design={{
                    position: 'relative',
                    flexShrink: 0,
                  }}
                >
                  <Avatar
                    src={chat.avatar}
                    alt={chat.title || chat.customerName || 'Chat'}
                    size="md"
                    initials={chat.title?.[0] || chat.customerName?.[0] || '?'}
                  />
                  {/* Integration badge */}
                  <Box
                    as="div"
                    design={{
                      position: 'absolute',
                      bottom: '-2px',
                      right: '-2px',
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      bg: 'color.bg.primary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      border: '2px solid',
                      borderColor: 'color.bg.primary',
                      boxShadow: 'shadow.sm',
                    }}
                  >
                    {getIntegrationIcon(chat.type)}
                  </Box>
                </Box>

                {/* Content */}
                <Flex 
                  direction="column" 
                  gap="xs"
                  design={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Title & Time */}
                  <Flex justify="space-between" align="center">
                    <Text 
                      design={{ 
                        fontWeight: '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chat.title || chat.customerName || chat.orderNumber || 'Без названия'}
                    </Text>
                    <Text 
                      size="sm" 
                      design={{ 
                        color: 'color.text.secondary',
                        flexShrink: 0,
                        marginLeft: 2,
                      }}
                    >
                      {formatTime(chat.lastMessageAt)}
                    </Text>
                  </Flex>

                  {/* Last Message */}
                  <Flex justify="space-between" align="center">
                    <Text 
                      size="sm" 
                      design={{ 
                        color: 'color.text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chat.lastMessageText || 'Нет сообщений'}
                    </Text>
                    {chat.unreadCount > 0 && (
                      <Badge preset="primary" design={{ flexShrink: 0, marginLeft: 2 }}>
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </Badge>
                    )}
                  </Flex>

                  {/* Meta info */}
                  {(chat.orderNumber || chat.status !== 'active') && (
                    <Flex gap="xs" align="center">
                      {chat.orderNumber && (
                        <Badge preset="info">
                          📦 {chat.orderNumber}
                        </Badge>
                      )}
                      {chat.status === 'archived' && (
                        <Badge preset="info">
                          📁 Архив
                        </Badge>
                      )}
                      {chat.status === 'closed' && (
                        <Badge preset="info">
                          🔒 Закрыт
                        </Badge>
                      )}
                    </Flex>
                  )}
                </Flex>
              </Flex>
            </Box>
          ))
        )}
      </Flex>
    </Flex>
  );
};

