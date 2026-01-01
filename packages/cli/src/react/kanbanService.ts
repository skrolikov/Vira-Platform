// src/services/kanban.ts
export const kanbanService = `// Kanban service using Vira Core DI container + VRP
// This demonstrates the Vira standard: services for business logic, hooks for React state

import { createService, useService } from '@vira-ui/core';
import { useViraState } from '@vira-ui/react';
import type { KanbanBoard, KanbanCard, KanbanChannel } from '../models/kanban';

// Create kanban service (singleton via DI container)
// Service holds pure business logic helpers
createService('kanban', () => ({
  getColumnCards(board: KanbanBoard | null, columnId: string): KanbanCard[] {
    if (!board) return [];
    const column = board.columns.find(col => col.id === columnId);
    if (!column) return [];
    return column.cardIds
      .map(id => board.cards[id])
      .filter((card): card is KanbanCard => card !== undefined)
      .sort((a, b) => a.order - b.order);
  },
}));

// Hook for board operations (combines service + VRP state)
export function useKanbanBoard(boardId: string) {
  const channel: KanbanChannel = \`kanban:\${boardId}\`;
  const { data: board, sendEvent, sendUpdate, sendDiff } = useViraState<KanbanBoard>(channel, null);
  const kanbanService = useService<{ getColumnCards: (board: KanbanBoard | null, columnId: string) => KanbanCard[] }>('kanban');

  return {
    board,
    // Card operations
    createCard(columnId: string, title: string, description?: string) {
      sendEvent('kanban.card.create', {
        boardId,
        columnId,
        title,
        description,
        at: Date.now(),
      });
    },
    updateCard(cardId: string, updates: Partial<Pick<KanbanCard, 'title' | 'description' | 'assignee' | 'tags'>>) {
      sendDiff({
        cards: {
          [cardId]: updates,
        },
        updatedAt: Date.now(),
      });
    },
    moveCard(cardId: string, fromColumnId: string, toColumnId: string, newOrder: number) {
      sendEvent('kanban.card.move', {
        boardId,
        cardId,
        fromColumnId,
        toColumnId,
        newOrder,
        at: Date.now(),
      });
    },
    deleteCard(cardId: string) {
      sendEvent('kanban.card.delete', {
        boardId,
        cardId,
        at: Date.now(),
      });
    },
    // Column operations
    createColumn(title: string, order: number) {
      sendEvent('kanban.column.create', {
        boardId,
        title,
        order,
        at: Date.now(),
      });
    },
    updateColumn(columnId: string, title: string) {
      if (!board) return;
      sendDiff({
        columns: board.columns.map(col =>
          col.id === columnId ? { ...col, title } : col
        ),
        updatedAt: Date.now(),
      });
    },
    // Board operations
    updateBoardTitle(title: string) {
      sendDiff({
        title,
        updatedAt: Date.now(),
      });
    },
    // Helper: get cards for a column (uses service)
    getColumnCards(columnId: string): KanbanCard[] {
      return kanbanService.getColumnCards(board, columnId);
    },
  };
}
`;

