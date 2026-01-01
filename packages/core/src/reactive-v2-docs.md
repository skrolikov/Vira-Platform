# Vira Reactive V2 - Полностью реактивное ядро

## Цель

Создать полностью реактивную систему, которая **полностью избавляет от необходимости использовать `useState` и `useEffect`** для управления состоянием в React компонентах.

## Основные концепции

### 1. `reactive()` - Реактивные значения

Создание реактивного значения, которое автоматически обновляет все подписчики при изменении.

```typescript
import { reactive, useReactive } from "@vira-ui/core";

// Создаём реактивное значение
const count = reactive(0);

function Counter() {
  // Используем в компоненте (автоматическая подписка)
  const countValue = useReactive(count);
  
  return (
    <div>
      <button onClick={() => count.value++}>+</button>
      <span>{countValue}</span>
      <button onClick={() => count.value--}>-</button>
    </div>
  );
}
```

**Преимущества:**
- Нет `useState` - состояние живёт вне компонента
- Автоматические обновления - компонент обновляется при изменении
- Совместное использование - одно значение может использоваться в нескольких компонентах

### 2. `computed()` - Вычисляемые значения

Автоматически пересчитываются при изменении зависимостей.

```typescript
import { reactive, computed, useReactive } from "@vira-ui/core";

const count = reactive(0);
const doubleCount = computed(() => count.value * 2);
const tripleCount = computed(() => count.value * 3);

function Counter() {
  const double = useReactive(doubleCount);
  const triple = useReactive(tripleCount);
  
  return (
    <div>
      <button onClick={() => count.value++}>+</button>
      <div>Count: {count.value}</div>
      <div>Double: {double}</div>
      <div>Triple: {triple}</div>
    </div>
  );
}
```

**Преимущества:**
- Автоматическое пересчитывание
- Мемоизация - значение кэшируется до изменения зависимостей
- Цепочки computed - computed может зависеть от другого computed

### 3. `effect()` - Побочные эффекты

Замена `useEffect` - автоматически запускается при изменении зависимостей.

```typescript
import { reactive, effect } from "@vira-ui/core";

const count = reactive(0);

// Эффект запускается при каждом изменении count
effect(() => {
  console.log("Count changed:", count.value);
  
  // Cleanup функция (аналог return в useEffect)
  return () => {
    console.log("Cleanup");
  };
});
```

**В React компонентах:**

```typescript
import { reactive, useReactiveEffect, useReactive } from "@vira-ui/core";

const count = reactive(0);

function Counter() {
  const countValue = useReactive(count);
  
  // Эффект в компоненте
  useReactiveEffect(() => {
    document.title = `Count: ${count.value}`;
    return () => {
      document.title = "App";
    };
  });
  
  return <button onClick={() => count.value++}>{countValue}</button>;
}
```

### 4. `reactiveObject()` - Реактивные объекты

Создание объекта с несколькими реактивными свойствами.

```typescript
import { reactiveObject, useReactive } from "@vira-ui/core";

const user = reactiveObject({
  name: "John",
  age: 30,
  email: "john@example.com",
});

function UserProfile() {
  const name = useReactive(user.name);
  const age = useReactive(user.age);
  
  return (
    <div>
      <input 
        value={name} 
        onChange={(e) => user.name.value = e.target.value} 
      />
      <input 
        type="number"
        value={age} 
        onChange={(e) => user.age.value = Number(e.target.value)} 
      />
    </div>
  );
}
```

## Полный пример без useState/useEffect

### До (с useState/useEffect):

```typescript
function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  
  useEffect(() => {
    console.log("Todos changed:", todos);
  }, [todos]);
  
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    });
  }, [todos, filter]);
  
  return (
    <div>
      <input 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
      />
      {filteredTodos.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
```

### После (полностью реактивное):

```typescript
import { reactive, computed, useReactive, useReactiveEffect } from "@vira-ui/core";

// Реактивное состояние вне компонента
const todos = reactive([]);
const filter = reactive("all");

// Вычисляемые значения
const filteredTodos = computed(() => {
  const list = todos.value;
  if (filter.value === "active") return list.filter(t => !t.completed);
  if (filter.value === "completed") return list.filter(t => t.completed);
  return list;
});

function TodoApp() {
  // Использование в компоненте
  const filterValue = useReactive(filter);
  const filtered = useReactive(filteredTodos);
  
  // Эффект
  useReactiveEffect(() => {
    console.log("Todos changed:", todos.value);
  });
  
  return (
    <div>
      <input 
        value={filterValue} 
        onChange={(e) => filter.value = e.target.value} 
      />
      {filtered.map(todo => (
        <div key={todo.id}>{todo.text}</div>
      ))}
    </div>
  );
}
```

## Преимущества полностью реактивного подхода

1. **Нет useState** - состояние живёт вне компонентов, легко тестировать
2. **Нет useEffect** - эффекты автоматически запускаются при изменении зависимостей
3. **Нет useMemo/useCallback** - computed значения автоматически мемоизируются
4. **Совместное использование** - одно состояние может использоваться в нескольких компонентах
5. **Автоматические обновления** - компоненты обновляются только при реальных изменениях
6. **Проще тестировать** - состояние можно тестировать отдельно от компонентов
7. **Лучшая производительность** - batch updates, мемоизация computed

## Интеграция с существующими сервисами

```typescript
import { createService, createReactiveService, reactive } from "@vira-ui/core";

class TodoService {
  todos = reactive([]);
  filter = reactive("all");
  
  addTodo(text: string) {
    this.todos.value = [...this.todos.value, { id: Date.now(), text, completed: false }];
  }
  
  toggleTodo(id: number) {
    this.todos.value = this.todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }
}

const todoService = createReactiveService(new TodoService());

// В компоненте
function TodoApp() {
  const todos = useReactiveService("todo").todos;
  const todosList = useReactive(todos);
  
  return <div>{todosList.map(...)}</div>;
}
```

## Roadmap

- [ ] Реализовать `reactive()`, `computed()`, `effect()`
- [ ] Интеграция с React хуками
- [ ] Batch updates для оптимизации
- [ ] DevTools для отладки
- [ ] SSR поддержка
- [ ] Миграция существующих сервисов

