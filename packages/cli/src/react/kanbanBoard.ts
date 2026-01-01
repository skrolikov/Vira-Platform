// src/components/KanbanBoard.tsx
export const kanbanBoard = `import { Container, Flex, Input, Text, Box } from '@vira-ui/ui';
import { useKanbanBoard } from '../services/kanban';
import { KanbanColumn } from './KanbanColumn';

interface KanbanBoardProps {
  boardId: string;
}

export function KanbanBoard({ boardId }: KanbanBoardProps) {
  const board = useKanbanBoard(boardId);

  if (!board.board) {
    return (
      <Box design={{ padding: 10, textAlign: 'center', color: '#999' }}>
        <Text>Loading board...</Text>
      </Box>
    );
  }

  return (
    <Container design={{ padding: 6, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box design={{ marginBottom: 6 }}>
        <Input
          model={\`kanban.\${boardId}.title\`}
          value={board.board.title}
          onChange={(e) => board.updateBoardTitle(e.target.value)}
          design={{
            fontSize: '24px',
            fontWeight: 'bold',
            border: 'none',
            borderBottom: '2px solid transparent',
            padding: 1,
          }}
          onFocus={(e) => {
            e.target.style.borderBottomColor = '#007bff';
          }}
          onBlur={(e) => {
            e.target.style.borderBottomColor = 'transparent';
          }}
        />
      </Box>
      <Flex
        gap={4}
        design={{
          overflowX: 'auto',
          flex: 1,
          paddingBottom: 4,
        }}
      >
        {board.board.columns
          .sort((a, b) => a.order - b.order)
          .map(column => (
            <KanbanColumn key={column.id} column={column} boardId={boardId} />
          ))}
      </Flex>
    </Container>
  );
}
`;

