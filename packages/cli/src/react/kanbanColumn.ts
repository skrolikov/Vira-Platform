// src/components/KanbanColumn.tsx
export const kanbanColumn = `import { Box, Flex, Text, Button, ScrollArea } from '@vira-ui/ui';
import { useKanbanBoard } from '../services/kanban';
import { KanbanColumn as ColumnType } from '../models/kanban';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  column: ColumnType;
  boardId: string;
}

export function KanbanColumn({ column, boardId }: KanbanColumnProps) {
  const board = useKanbanBoard(boardId);
  const cards = board.getColumnCards(column.id);

  const handleAddCard = () => {
    const title = prompt('Card title:');
    if (title) {
      board.createCard(column.id, title);
    }
  };

  return (
    <Box
      design={{
        background: '#f5f5f5',
        borderRadius: 'var(--radius-sm)',
        padding: 4,
        minWidth: '280px',
        maxHeight: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Text design={{  fontSize: '16px',  }}>
        {column.title}
      </Text>
      <ScrollArea
        design={{
          flex: 1,
          
        }}
      >
        <Flex direction="column" gap={2}>
          {cards.map(card => (
            <KanbanCard key={card.id} card={card} boardId={boardId} />
          ))}
        </Flex>
      </ScrollArea>
      <Button
        preset="ghost"
        design={{
          width: '100%',
          border: '1px dashed #ccc',
          padding: 2,
        }}
        onClick={handleAddCard}
      >
        + Add card
      </Button>
    </Box>
  );
}
`;

