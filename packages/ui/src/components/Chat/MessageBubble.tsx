import React from 'react';
import { Flex } from '../Flex';
import { Avatar } from '../Avatar';
import { Text } from '../Text';
import { Badge } from '../Badge';
import { Box } from '../Box';
import { Button } from '../Button';
import { Image } from '../Image';
import './Chat.css';

export interface MessageAttachment {
  url: string;
  name: string;
  size: number;
  type: 'image' | 'file' | 'audio' | 'video';
}

export interface MessageBubbleProps {
  id: string;
  content: string;
  senderName?: string;
  senderAvatar?: string;
  senderType: 'user' | 'customer' | 'system' | 'bot';
  type: 'text' | 'image' | 'file' | 'audio' | 'video' | 'location' | 'system';
  createdAt: Date;
  isOwn: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  attachments?: MessageAttachment[];
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  editedAt?: Date;
  onReply?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

const getStatusIcon = (status?: string): string => {
  switch (status) {
    case 'sent': return '✓';
    case 'delivered': return '✓✓';
    case 'read': return '✓✓';
    case 'failed': return '✗';
    default: return '';
  }
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  id,
  content,
  senderName,
  senderAvatar,
  senderType,
  type,
  createdAt,
  isOwn,
  status,
  attachments = [],
  replyTo,
  editedAt,
  onReply,
  onDelete
}) => {
  const [showActions, setShowActions] = React.useState(false);

  if (type === 'system') {
    return (
      <Flex justify="center" design={{ padding: '8px 0' }}>
        <Badge preset="info">
          {content}
        </Badge>
      </Flex>
    );
  }

  return (
    <Flex
      justify={isOwn ? 'flex-end' : 'flex-start'}
      design={{
        padding: '2px 0',
        animation: 'messageSlideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Flex gap="sm" align="flex-end" design={{ maxWidth: '70%' }}>
        {/* Avatar (only for incoming messages) */}
        {!isOwn && (
          <Avatar
            src={senderAvatar}
            alt={senderName || 'User'}
            size="sm"
            initials={senderName?.[0] || '?'}
            design={{ flexShrink: 0 }}
          />
        )}

        <Flex direction="column" gap="xs" design={{ flex: 1 }}>
          {/* Sender name (for group chats) */}
          {!isOwn && senderName && (
            <Text 
              size="sm" 
              design={{ 
                color: 'color.text.secondary',
                paddingLeft: '12px',
              }}
            >
              {senderName}
            </Text>
          )}

          {/* Message bubble */}
          <Box
            as="div"
            design={{
              padding: '10px 14px',
              borderRadius: '16px',
              maxWidth: '100%',
              wordWrap: 'break-word',
              position: 'relative',
              boxShadow: isOwn ? 'shadow.md' : 'shadow.sm',
              transition: 'all 0.2s ease',
              background: isOwn 
                ? 'color.primary' 
                : 'color.bg.primary',
              color: isOwn ? 'white' : 'color.text.primary',
              border: isOwn ? 'none' : '1px solid',
              borderColor: isOwn ? 'transparent' : 'color.border.primary',
              borderBottomRightRadius: isOwn ? '4px' : '16px',
              borderBottomLeftRadius: isOwn ? '16px' : '4px',
              hover: {
                boxShadow: isOwn ? 'shadow.lg' : 'shadow.md',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {/* Reply preview */}
            {replyTo && (
              <Box
                as="div"
                design={{
                  padding: 2,
                  marginBottom: 2,
                  borderLeft: '3px solid',
                  borderLeftColor: isOwn ? 'rgba(255,255,255,0.5)' : 'color.primary',
                  bg: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                }}
              >
                <Text size="sm" design={{ color: isOwn ? 'white' : 'color.primary', fontWeight: '600' }}>
                  {replyTo.senderName}
                </Text>
                <Text size="sm" design={{ color: isOwn ? 'rgba(255,255,255,0.8)' : 'color.text.secondary' }}>
                  {replyTo.content}
                </Text>
              </Box>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <Flex direction="column" gap="xs" design={{ marginBottom: 2 }}>
                {attachments.map((attachment, idx) => (
                  <Box key={idx} as="div">
                    {attachment.type === 'image' ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.name}
                        design={{
                          maxWidth: '100%',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'block',
                        }}
                      />
                    ) : (
                      <Box
                        as="div"
                        design={{
                          padding: 2,
                          bg: 'color.bg.secondary',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          hover: {
                            bg: 'color.bg.tertiary',
                          },
                        }}
                      >
                        <Flex gap="sm" align="center">
                          <Box
                            as="div"
                            design={{
                              fontSize: '1.5rem',
                              flexShrink: 0,
                            }}
                          >
                            📎
                          </Box>
                          <Flex direction="column" gap="xs" design={{ flex: 1, minWidth: 0 }}>
                            <Text 
                              size="sm" 
                              design={{ 
                                fontWeight: '600',
                                color: isOwn ? 'white' : 'color.text.primary',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {attachment.name}
                            </Text>
                            <Text size="xs" design={{ color: isOwn ? 'rgba(255,255,255,0.8)' : 'color.text.secondary' }}>
                              {(attachment.size / 1024).toFixed(1)} KB
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                    )}
                  </Box>
                ))}
              </Flex>
            )}

            {/* Content */}
            <Text 
              design={{ 
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                color: isOwn ? 'white' : 'color.text.primary',
              }}
            >
              {content}
            </Text>

            {/* Time & Status */}
            <Flex justify="flex-end" align="center" gap="xs" design={{ marginTop: 1 }}>
              {editedAt && (
                <Text size="xs" design={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'color.text.secondary' }}>
                  изм.
                </Text>
              )}
              <Text size="xs" design={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'color.text.secondary' }}>
                {formatTime(createdAt)}
              </Text>
              {isOwn && status && (
                <Text 
                  size="xs" 
                  design={{ 
                    color: status === 'read' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {getStatusIcon(status)}
                </Text>
              )}
            </Flex>
          </Box>

          {/* Actions (on hover) */}
          {showActions && (onReply || onDelete) && (
            <Flex 
              gap="xs" 
              justify={isOwn ? 'flex-end' : 'flex-start'}
              design={{
                opacity: showActions ? 1 : 0,
                transition: 'opacity 0.2s',
                marginTop: 1,
              }}
            >
              {onReply && (
                <Button
                  preset="ghost"
                  onClick={() => onReply(id)}
                  title="Ответить"
                  design={{
                    padding: '4px 8px',
                    fontSize: '0.875rem',
                    minWidth: 'auto',
                    height: 'auto',
                    bg: 'color.bg.secondary',
                    borderRadius: '6px',
                    hover: {
                      bg: 'color.bg.tertiary',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  ↩️
                </Button>
              )}
              {onDelete && isOwn && (
                <Button
                  preset="ghost"
                  onClick={() => onDelete(id)}
                  title="Удалить"
                  design={{
                    padding: '4px 8px',
                    fontSize: '0.875rem',
                    minWidth: 'auto',
                    height: 'auto',
                    bg: 'color.danger.light',
                    borderRadius: '6px',
                    hover: {
                      bg: 'color.danger',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  🗑️
                </Button>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

