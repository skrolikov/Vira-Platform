// src/components/KanbanCard.tsx
export const kanbanCard = `import { Card, Flex, Box, Text, Tag, Button } from '@vira-ui/ui';
import { useKanbanBoard } from '../services/kanban';
import { KanbanCard as CardType } from '../models/kanban';

interface KanbanCardProps {
  card: CardType;
  boardId: string;
}

export function KanbanCard({ card, boardId }: KanbanCardProps) {
  const board = useKanbanBoard(boardId);

  return (
    <Card
      design={{
        marginBottom: 2,
        cursor: 'pointer',
        padding: 3,
      }}
      onClick={() => {
        // Open card details (future: modal)
      }}
    >
      <Text design={{ fontWeight: 600, fontSize: '14px', marginBottom: 1 }}>
        {card.title}
      </Text>
      {card.description && (
        <Text design={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
          {card.description}
        </Text>
      )}
      <Flex justify="space-between" align="center">
        <Flex gap={1}>
          {card.assignee && (
            <Text design={{ fontSize: '11px', color: '#888' }}>@{card.assignee}</Text>
          )}
          {card.tags && card.tags.length > 0 && (
            <Flex gap={1}>
              {card.tags.map(tag => (
                <Tag key={tag} design={{ fontSize: '10px' }}>
                  {tag}
                </Tag>
              ))}
            </Flex>
          )}
        </Flex>
        <Button
          preset="ghost"
          design={{ padding: 1, minWidth: 'auto' }}
          onClick={(e) => {
            e.stopPropagation();
            board.deleteCard(card.id);
          }}
        >
          ×
        </Button>
      </Flex>
    </Card>
  );
}
`;

