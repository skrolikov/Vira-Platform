import React, { useMemo } from 'react';
import { Phone, MessageCircle, Globe, ShoppingCart, User, MessageSquare, Archive, Lock, Search } from 'lucide-react';
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

const getIntegrationIcon = (type: string) => {
  const iconSize = 14;
  switch (type) {
    case 'telegram': return <Phone size={iconSize} />;
    case 'whatsapp': return <MessageCircle size={iconSize} />;
    case 'website': return <Globe size={iconSize} />;
    case 'order': return <ShoppingCart size={iconSize} />;
    case 'contact': return <User size={iconSize} />;
    default: return <MessageSquare size={iconSize} />;
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
      }}
    >
      {/* Header */}
      <Box
        as="div"
        design={{
          padding: 3,
          bg: 'color.bg.primary',
        }}
      >
        <Heading 
          level={3} 
          design={{ 
            margin: 0, 
            
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
                padding: 2,
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                bg: selectedChatId === chat.id ? 'color.bg.tertiary' : 'transparent',
                paddingLeft: selectedChatId === chat.id ? 2 : 2,
                textAlign: 'left',
                width: '100%',
                border: 'none',
                hover: {
                  bg: selectedChatId === chat.id ? 'color.bg.tertiary' : 'color.bg.hover',
                },
              }}
            >
              <Flex gap={2} align="flex-start">
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
                      borderRadius: 'var(--radius-full)',
                      bg: 'color.bg.primary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'shadow.sm',
                      color: 'color.text.secondary',
                    }}
                  >
                    {getIntegrationIcon(chat.type)}
                  </Box>
                </Box>

                {/* Content */}
                <Flex 
                  direction="column" 
                  gap={3}
                  design={{
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {/* Title & Time */}
                  <Flex justify="space-between" align="center">
                    <Text 
                      design={{ 
                        fontWeight: 'var(--typography-fontWeight-semibold)',
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
                    <Flex gap={3} align="center">
                      {chat.orderNumber && (
                        <Badge preset="info" design={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShoppingCart size={12} />
                          {chat.orderNumber}
                        </Badge>
                      )}
                      {chat.status === 'archived' && (
                        <Badge preset="info" design={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Archive size={12} />
                          Архив
                        </Badge>
                      )}
                      {chat.status === 'closed' && (
                        <Badge preset="info" design={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} />
                          Закрыт
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

