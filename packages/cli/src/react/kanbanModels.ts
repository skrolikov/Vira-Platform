// src/models/kanban.ts
export const kanbanModels = `// Kanban data models (shared with backend)

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  order: number;
  assignee?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
  cardIds: string[]; // ordered list
}

export interface KanbanBoard {
  id: string;
  title: string;
  columns: KanbanColumn[];
  cards: Record<string, KanbanCard>; // cardId -> Card
  createdAt: number;
  updatedAt: number;
}

// VRP Channel types
export type KanbanChannel = \`kanban:\${string}\`;
`;

