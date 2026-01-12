// src/App.tsx - Kanban reference app (VRP + Vira UI/Core standards)
export const kanbanAppTsx = `import { ViraProvider } from '@vira-ui/ui';
import { Box } from '@vira-ui/ui';
import { KanbanBoard } from './components/KanbanBoard';
import './index.css';

/**
 * Kanban Reference App - Demonstrates Vira Framework standards:
 * 
 * ✅ Uses @vira-ui/ui components (Card, Button, Flex, Box, Input, etc.)
 * ✅ Uses @vira-ui/core services (createService/useService)
 * ✅ Uses VRP for state (useViraState hook)
 * ✅ Declarative style (no inline styles, no manual state management)
 * ✅ Server-authoritative state (client is terminal)
 * ✅ Auto-binding ready (action/model props)
 * 
 * This is THE standard for VIRA SMPs.
 */

export function App() {
  const boardId = 'demo-board';

  return (
    <ViraProvider hideDataDesign={false} theme="default">
      <Box design={{ height: '100vh', background: '#fafafa' }}>
        <KanbanBoard boardId={boardId} />
      </Box>
    </ViraProvider>
  );
}
`;

