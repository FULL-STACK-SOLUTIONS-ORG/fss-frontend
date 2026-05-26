import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableModuleCard = ({
  module,
  onEdit,
  onDelete,
  onAddTopic,
  onEditTopic,
  onDeleteTopic,
  currentTopicDragHandlers
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
    touchAction: 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl shadow-sm p-6 border-2 transition-all ${
        isDragging ? 'border-[#9B7D43] shadow-xl scale-105' : 'border-[#D4C9B8] hover:border-[#9B7D43]/50'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 flex gap-3">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-[#9A8A7A] hover:text-[#5A5550] touch-none"
            title="Drag to reorder"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          <div>
            <h3 className="text-xl font-bold text-[#1C1A17] mb-2">{module.title}</h3>
            {module.category && (
              <p className="text-sm text-[#5A5550] mb-3">
                <span className="font-semibold">Category:</span> {module.category}
              </p>
            )}
            <p className="text-xs text-[#5A5550] font-semibold">
              {module.topics?.length || 0} {module.topics?.length === 1 ? 'Topic' : 'Topics'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(module)}
            className="text-blue-600 hover:text-blue-800 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
            title="Edit Module"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(module._id)}
            className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
            title="Delete Module"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => onAddTopic(module)}
          className="flex-1 px-4 py-2 bg-[#9B7D43] hover:bg-[#7A6235] text-white rounded-lg transition-colors text-sm font-semibold flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Topic
        </button>
      </div>

      {module.topics && module.topics.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {[...module.topics].sort((a, b) => (a.order || 0) - (b.order || 0)).map((topic, index) => (
            <div
              key={topic._id || index}
              draggable
              onDragStart={(e) => currentTopicDragHandlers.onDragStart(e, topic, module._id)}
              onDragOver={(e) => currentTopicDragHandlers.onDragOver(e, topic)}
              onDrop={(e) => currentTopicDragHandlers.onDrop(e, topic, module._id)}
              onDragEnd={currentTopicDragHandlers.onDragEnd}
              className={`flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-lg hover:bg-[#F5F0E8] transition-colors border border-[#D4C9B8] cursor-move ${
                currentTopicDragHandlers.draggedTopic?.topic._id === topic._id ? 'opacity-50' : ''
              } ${currentTopicDragHandlers.draggedOverTopic?._id === topic._id ? 'border-[#9B7D43] bg-[#9B7D43]/5' : ''}`}
            >
              <div className="flex items-center gap-2 flex-1">
                <svg className="w-5 h-5 text-[#9A8A7A] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  topic.completed ? 'bg-green-500 border-green-500' : 'bg-white border-[#D4C9B8]'
                }`}>
                  {topic.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm flex-1 ${topic.completed ? 'line-through text-[#9A8A7A]' : 'text-[#1C1A17]'}`}>
                  {topic.name}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => onEditTopic(module, topic)}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Topic"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDeleteTopic(module._id, topic._id)}
                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete Topic"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-[#5A5550] text-sm">
          No topics yet. Click "Add Topic" to get started.
        </div>
      )}
    </div>
  );
};

export default SortableModuleCard;
