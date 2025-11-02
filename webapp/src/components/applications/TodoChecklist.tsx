"use client";

import { useState, useRef, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface TodoChecklistProps {
  applicationId: string;
  initialTodos?: TodoItem[];
  onUpdate?: (todos: TodoItem[]) => Promise<void>;
  className?: string;
  isGenerating?: boolean;
}

export function TodoChecklist({
  applicationId,
  initialTodos = [],
  onUpdate,
  className,
  isGenerating = false,
}: TodoChecklistProps) {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const saveTodos = async (updatedTodos: TodoItem[]) => {
    if (onUpdate) {
      setIsSaving(true);
      try {
        await onUpdate(updatedTodos);
      } catch (error) {
        console.error("Failed to save todo:", error);
        // Rollback on error
        setTodos(todos);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleToggleTodo = async (todoId: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    await saveTodos(updatedTodos);
  };

  const handleTextChange = (todoId: string, newText: string) => {
    const updatedTodos = todos.map((todo) =>
      todo.id === todoId ? { ...todo, text: newText } : todo
    );
    setTodos(updatedTodos);
  };

  const handleTextBlur = async (todoId: string, text: string) => {
    setEditingId(null);

    // If text is empty, delete the todo
    if (!text.trim()) {
      const updatedTodos = todos.filter((todo) => todo.id !== todoId);
      setTodos(updatedTodos);
      await saveTodos(updatedTodos);
      return;
    }

    // Save the updated text
    await saveTodos(todos);
  };

  const handleAddNewTodo = async () => {
    const newTodo: TodoItem = {
      id: `todo_${Date.now()}`,
      text: "",
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const updatedTodos = [...todos, newTodo];
    setTodos(updatedTodos);
    setEditingId(newTodo.id);
  };

  const handleKeyDown = async (
    e: React.KeyboardEvent,
    todoId: string,
    text: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleTextBlur(todoId, text);
      // Add a new todo after pressing Enter
      if (text.trim()) {
        await handleAddNewTodo();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setEditingId(null);
      // If the todo is empty, remove it
      if (!text.trim()) {
        const updatedTodos = todos.filter((todo) => todo.id !== todoId);
        setTodos(updatedTodos);
        await saveTodos(updatedTodos);
      }
    }
  };

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Checklist</h3>
        {totalCount > 0 && (
          <span className="text-sm text-muted-foreground">
            {completedCount} / {totalCount}
          </span>
        )}
      </div>

      {/* Loading state when AI is generating */}
      {isGenerating && todos.length === 0 ? (
        <div className="space-y-1">
          {/* Skeleton loading items */}
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-1 py-2 rounded-md animate-pulse"
            >
              <div className="size-4 rounded-[4px] border-2 bg-muted/50" />
              <div className="flex-1 h-4 bg-muted/50 rounded" />
            </div>
          ))}
          <p className="text-sm text-muted-foreground mt-3 italic">
            🤖 AI is generating your checklist...
          </p>
        </div>
      ) : (
        <>
          {/* Todo list */}
          <div className="space-y-1">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isEditing={editingId === todo.id}
                onToggle={() => handleToggleTodo(todo.id)}
                onTextChange={(text) => handleTextChange(todo.id, text)}
                onBlur={(text) => handleTextBlur(todo.id, text)}
                onKeyDown={(e, text) => handleKeyDown(e, todo.id, text)}
                onStartEdit={() => setEditingId(todo.id)}
                disabled={isSaving}
              />
            ))}

            {/* Empty state / Add new todo */}
            {todos.length === 0 ? (
              <div
                className="flex items-center gap-3 px-1 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={handleAddNewTodo}
              >
                <Checkbox disabled />
                <span className="text-sm text-muted-foreground">
                  Add your first todo
                </span>
              </div>
            ) : (
              <div
                className="flex items-center gap-3 px-1 py-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group"
                onClick={handleAddNewTodo}
              >
                <Checkbox disabled />
                <span className="text-sm text-muted-foreground">
                  Add a todo
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface TodoItemProps {
  todo: TodoItem;
  isEditing: boolean;
  onToggle: () => void;
  onTextChange: (text: string) => void;
  onBlur: (text: string) => void;
  onKeyDown: (e: React.KeyboardEvent, text: string) => void;
  onStartEdit: () => void;
  disabled: boolean;
}

function TodoItem({
  todo,
  isEditing,
  onToggle,
  onTextChange,
  onBlur,
  onKeyDown,
  onStartEdit,
  disabled,
}: TodoItemProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end
      inputRef.current.setSelectionRange(
        inputRef.current.value.length,
        inputRef.current.value.length
      );
    }
  }, [isEditing]);

  return (
    <div className="flex items-center gap-3 px-1 py-2 rounded-md hover:bg-muted/50 transition-colors group">
      <Checkbox
        checked={todo.completed}
        onCheckedChange={onToggle}
        disabled={disabled}
      />
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={todo.text}
            onChange={(e) => onTextChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
            onKeyDown={(e) => onKeyDown(e, todo.text)}
            className={cn(
              "w-full bg-transparent text-sm outline-none border-none p-0",
              "focus:outline-none focus:ring-0",
              todo.completed && "line-through text-muted-foreground"
            )}
            placeholder="Type your todo..."
            disabled={disabled}
          />
        ) : (
          <div
            className={cn(
              "text-sm cursor-text select-none",
              todo.completed && "line-through text-muted-foreground",
              !todo.text && "text-muted-foreground italic"
            )}
            onClick={onStartEdit}
          >
            {todo.text || "Empty todo"}
          </div>
        )}
      </div>
    </div>
  );
}
