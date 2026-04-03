import React, { useState, useRef, useEffect } from 'react';
import { X, Paperclip, MessageSquare, Send, Search } from 'lucide-react';
import { Flex } from '../Flex';
import { Button } from '../Button';
import { Badge } from '../Badge';
import { Text } from '../Text';
import { Box } from '../Box';
import { Textarea } from '../Textarea';
import { Popover } from '../Popover';
import { Card } from '../Card';
import './Chat.css';

export interface QuickReplyTemplate {
  id: string;
  name: string;
  content: string;
  shortcut?: string;
  category?: string;
}

interface MessageInputProps {
  onSend: (content: string, attachments?: File[]) => void;
  onTyping?: () => void;
  placeholder?: string;
  templates?: QuickReplyTemplate[];
  disabled?: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  onCancelReply?: () => void;
  maxLength?: number;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  onTyping,
  placeholder = 'Введите сообщение...',
  templates = [],
  disabled = false,
  replyTo,
  onCancelReply,
  maxLength = 4000
}) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-focus
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Typing indicator
  useEffect(() => {
    if (message && onTyping) {
      const timeout = setTimeout(onTyping, 300);
      return () => clearTimeout(timeout);
    }
  }, [message, onTyping]);

  const handleSend = () => {
    if (!message.trim() && attachments.length === 0) return;
    onSend(message.trim(), attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleTemplateSelect = (template: QuickReplyTemplate) => {
    setMessage(template.content);
    setShowTemplates(false);
    textareaRef.current?.focus();
  };

  // Check for shortcuts (e.g., /greeting)
  useEffect(() => {
    if (message.startsWith('/')) {
      const shortcut = message.slice(1).toLowerCase();
      const template = templates.find(t => t.shortcut?.toLowerCase() === shortcut);
      if (template) {
        setMessage(template.content);
      }
    }
  }, [message, templates]);

  return (
    <Flex direction="column" gap={2} design={{ width: '100%' }}>
      {/* Reply preview */}
      {replyTo && (
        <Box
          as="div"
          design={{
            padding: 2,
            bg: 'color.bg.secondary',
            borderRadius: "radius.md",
            borderLeft: '3px solid',
            borderLeftColor: 'color.primary',
          }}
        >
          <Flex justify="space-between" align="center">
            <Flex direction="column" gap={3}>
              <Text size="sm" design={{ fontWeight: 'var(--typography-fontWeight-semibold)', color: 'color.primary' }}>
                Ответ на: {replyTo.senderName}
              </Text>
              <Text 
                size="sm" 
                design={{ 
                  color: 'color.text.secondary',
                  maxWidth: '400px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {replyTo.content}
              </Text>
            </Flex>
            {onCancelReply && (
              <Button preset="ghost" onClick={onCancelReply} design={{ flexShrink: 0, padding: '4px' }}>
                <X size={20} />
              </Button>
            )}
          </Flex>
        </Box>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <Flex gap={3} wrap design={{ padding: '8px 0' }}>
          {attachments.map((file, idx) => (
            <Flex key={idx} align="center" gap={3}>
              <Badge preset="info" design={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Paperclip size={12} />
                {file.name}
              </Badge>
              <Button
                preset="ghost"
                onClick={() => handleRemoveAttachment(idx)}
                design={{ 
                  padding: '2px',
                  minWidth: 'auto',
                  width: '20px',
                  height: '20px',
                }}
              >
                <X size={12} />
              </Button>
            </Flex>
          ))}
        </Flex>
      )}

      {/* Input area */}
      <Flex gap={2} align="center">
        {/* Templates button */}
        {templates.length > 0 && (
          <Popover
            placement="top-start"
            trigger="click"
            disabled={disabled}
            content={
              <Card
                design={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  padding: 2,
                  minWidth: '300px',
                  maxWidth: '400px',
                  boxShadow: 'shadow.lg',
                }}
              >
                <Flex gap={2} align="center">
                  <MessageSquare size={20} style={{ color: 'var(--color-primary)' }} />
                  <Text design={{ fontWeight: 'var(--typography-fontWeight-semibold)' }} size="sm">
                    Быстрые ответы
                  </Text>
                </Flex>
                <Flex direction="column" gap={3}>
                  {templates.map(template => (
                    <Box
                      key={template.id}
                      as="button"
                      onClick={() => handleTemplateSelect(template)}
                      design={{
                        padding: 2,
                        border: 'none',
                        bg: 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderRadius: "radius.md",
                        transition: 'all 0.2s ease',
                        width: '100%',
                        hover: {
                          bg: 'color.bg.hover',
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Flex direction="column" gap={3}>
                        <Flex align="center" gap={3} justify="space-between">
                          <Text design={{ fontWeight: 'var(--typography-fontWeight-semibold)', color: 'color.text.primary' }} size="sm">
                            {template.name}
                          </Text>
                          {template.shortcut && (
                            <Badge preset="info" design={{ fontSize: '0.75rem' }}>
                              /{template.shortcut}
                            </Badge>
                          )}
                        </Flex>
                        <Text 
                          size="sm" 
                          design={{ 
                            color: 'color.text.secondary',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {template.content}
                        </Text>
                      </Flex>
                    </Box>
                  ))}
                </Flex>
              </Card>
            }
          >
            <Button 
              preset="ghost" 
              disabled={disabled}
              design={{ 
                flexShrink: 0,
                padding: '8px',
              }}
            >
              <MessageSquare size={20} />
            </Button>
          </Popover>
        )}

        {/* Attach file button */}
        <Button
          preset="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
        >
          <Paperclip size={20} />
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Text input */}
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
        />

        {/* Send button */}
        <Button
          preset="primary"
          onClick={handleSend}
          disabled={disabled || (!message.trim() && attachments.length === 0)}
        >
          <Send size={20} />
        </Button>
      </Flex>

      {/* Character count */}
      {message.length > maxLength * 0.8 && (
        <Text 
          size="xs" 
          design={{ 
            color: message.length >= maxLength ? 'color.danger' : 'color.text.secondary',
            textAlign: 'right',
          }}
        >
          {message.length} / {maxLength}
        </Text>
      )}
    </Flex>
  );
};

