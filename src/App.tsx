import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Trash2, Plus, Edit2 } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

type FilterType = 'all' | 'active' | 'completed';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    };
    
    setTodos([newTodo, ...todos]);
    setInputValue('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id);
    setEditValue(todo.text);
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      setEditingId(null);
      return;
    }
    setTodos(todos.map(todo => 
      todo.id === editingId ? { ...todo, text: editValue.trim() } : todo
    ));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const activeCount = todos.filter(todo => !todo.completed).length;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-200">
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-neutral-900 mb-2">
            Tasks
          </h1>
          <p className="text-neutral-500">
            {activeCount} {activeCount === 1 ? 'task' : 'tasks'} remaining
          </p>
        </header>

        <form onSubmit={addTodo} className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Plus className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 bg-white border-0 rounded-2xl shadow-sm ring-1 ring-inset ring-neutral-200 focus:ring-2 focus:ring-inset focus:ring-blue-500 text-lg transition-shadow placeholder:text-neutral-400"
            placeholder="What needs to be done?"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </form>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-inset ring-neutral-200 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50 gap-4 sm:gap-0">
            <div className="flex space-x-1 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-neutral-200 text-neutral-900'
                      : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            {todos.some(t => t.completed) && (
              <button
                onClick={clearCompleted}
                className="text-sm font-medium text-neutral-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 w-full sm:w-auto text-center sm:text-right"
              >
                Clear completed
              </button>
            )}
          </div>

          <ul className="divide-y divide-neutral-100">
            <AnimatePresence mode="popLayout">
              {filteredTodos.map(todo => (
                <motion.li
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  key={todo.id}
                  className={`group flex items-center gap-3 p-4 transition-colors ${
                    todo.completed ? 'bg-neutral-50/50' : 'bg-white hover:bg-neutral-50'
                  }`}
                >
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      todo.completed
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'border-neutral-300 text-transparent hover:border-blue-400'
                    }`}
                  >
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </button>

                  <div className="flex-1 min-w-0">
                    {editingId === todo.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          className="w-full px-3 py-1.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-neutral-900"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          onBlur={saveEdit}
                        />
                      </div>
                    ) : (
                      <span
                        className={`block truncate transition-all duration-200 cursor-text ${
                          todo.completed ? 'text-neutral-400 line-through' : 'text-neutral-700'
                        }`}
                        onDoubleClick={() => startEditing(todo)}
                      >
                        {todo.text}
                      </span>
                    )}
                  </div>

                  {editingId !== todo.id && (
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                      <button
                        onClick={() => startEditing(todo)}
                        className="p-2 text-neutral-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Edit todo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Delete todo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
            
            {filteredTodos.length === 0 && (
              <li className="p-8 text-center text-neutral-500">
                {filter === 'all' 
                  ? "You don't have any tasks yet." 
                  : filter === 'active' 
                    ? "You don't have any active tasks." 
                    : "You haven't completed any tasks."}
              </li>
            )}
          </ul>
        </div>
        
        <div className="mt-8 text-center text-sm text-neutral-400">
          <p>Double-click a task to edit</p>
        </div>
      </div>
    </div>
  );
}
