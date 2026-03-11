import React from 'react';
import { Check, CheckCheck, X, Reply, Trash2, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
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

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'sent': return <Check size={12} />;
    case 'delivered': return <CheckCheck size={12} />;
    case 'read': return <CheckCheck size={12} style={{ color: 'var(--color-primary)' }} />;
    case 'failed': return <X size={12} />;
    default: return null;
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
        position: 'relative',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <Flex gap={2} align="flex-end" design={{ maxWidth: '70%', position: 'relative' }}>
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

        {/* Actions buttons - positioned on the side */}
        {(onReply || onDelete) && (
          <Box
            as="div"
            style={{
              position: 'absolute',
              [isOwn ? 'left' : 'right']: '-45px',
              top: '50%',
              transform: 'translateY(-50%)',
              opacity: showActions ? 1 : 0,
              transition: 'opacity 0.1s ease',
              zIndex: 10,
              pointerEvents: showActions ? 'auto' : 'none',
            }}
            design={{
              bg: 'color.bg.primary',
              borderRadius: "radius.md",
              padding: '4px',
              boxShadow: 'shadow.md',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {onReply && (
              <Button
                preset="ghost"
                onClick={() => onReply(id)}
                title="Ответить"
                design={{
                  padding: '6px',
                  minWidth: 'auto',
                  height: 'auto',
                  bg: 'color.bg.secondary',
                  borderRadius: '6px',
                  color: 'color.text.primary',
                  hover: {
                    bg: 'color.bg.tertiary',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Reply size={14} style={{ color: 'var(--color-text-primary)' }} />
              </Button>
            )}
            {onDelete && isOwn && (
              <Button
                preset="ghost"
                onClick={() => onDelete(id)}
                title="Удалить"
                design={{
                  padding: '6px',
                  minWidth: 'auto',
                  height: 'auto',
                  bg: 'color.danger.light',
                  borderRadius: '6px',
                  color: 'color.danger',
                  hover: {
                    bg: 'color.danger',
                    color: 'color.text.primary',
                    transform: 'scale(1.05)',
                  },
                }}
              >
                <Trash2 size={14} />
              </Button>
            )}
          </Box>
        )}

        <Flex direction="column" gap={3} design={{ flex: 1 }}>
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
                  
                  bg: 'rgba(0, 0, 0, 0.1)',
                  borderRadius: '4px',
                }}
              >
                <Text size="sm" design={{ color: isOwn ? 'white' : 'color.primary', fontWeight: 'var(--typography-fontWeight-semibold)' }}>
                  {replyTo.senderName}
                </Text>
                <Text size="sm" design={{ color: isOwn ? 'rgba(255,255,255,0.8)' : 'color.text.secondary' }}>
                  {replyTo.content}
                </Text>
              </Box>
            )}

            {/* Attachments */}
            {attachments.length > 0 && (
              <Flex direction="column" gap={3}>
                {attachments.map((attachment, idx) => (
                  <Box key={idx} as="div">
                    {attachment.type === 'image' ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.name}
                        design={{
                          maxWidth: '100%',
                          borderRadius: "radius.md",
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
                          borderRadius: "radius.md",
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          hover: {
                            bg: 'color.bg.tertiary',
                          },
                        }}
                      >
                        <Flex gap={2} align="center">
                          <Box
                            as="div"
                            design={{
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '4px',
                              borderRadius: '4px',
                              bg: isOwn ? 'rgba(255,255,255,0.1)' : 'color.bg.tertiary',
                            }}
                          >
                            <Paperclip size={16} style={{ color: isOwn ? 'rgba(255,255,255,0.9)' : 'var(--color-text-secondary)' }} />
                          </Box>
                          <Flex direction="column" gap={3} design={{ flex: 1, minWidth: 0 }}>
                            <Text 
                              size="sm" 
                              design={{ 
                                fontWeight: 'var(--typography-fontWeight-semibold)',
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
            <Flex justify="flex-end" align="center" gap={3} >
              {editedAt && (
                <Text size="xs" design={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'color.text.secondary' }}>
                  изм.
                </Text>
              )}
              <Text size="xs" design={{ color: isOwn ? 'rgba(255,255,255,0.7)' : 'color.text.secondary' }}>
                {formatTime(createdAt)}
              </Text>
              {isOwn && status && (
                <Box
                  as="div"
                  design={{
                    display: 'flex',
                    alignItems: 'center',
                    color: status === 'read' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {getStatusIcon(status)}
                </Box>
              )}
            </Flex>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

