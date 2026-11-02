import React, { useState } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CandidateApplication, StatusConfig } from '../types';
import { Phone, Mail, Clock, MapPin, MoreHorizontal, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface KanbanCardProps {
  candidate: CandidateApplication;
  isDragging?: boolean;
}

function KanbanCard({ candidate, isDragging }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: candidate.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-3 group relative",
        isDragging && "opacity-50 grayscale scale-95"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded cursor-grab active:cursor-grabbing text-slate-400">
            <GripVertical className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
            {candidate.fullName}
          </h4>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <BriefcaseIcon className="w-3 h-3" />
          <span className="line-clamp-1">{candidate.offerTitle}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <MapPin className="w-3 h-3" />
          <span>{candidate.residence}</span>
        </div>
        {candidate.scheduledDate && (
          <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            <Clock className="w-3 h-3" />
            <span>{new Date(candidate.scheduledDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex -space-x-1">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
            {candidate.fullName.charAt(0)}
          </div>
        </div>
        <div className="flex gap-1">
          <a href={`tel:${candidate.phone}`} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            <Phone className="w-3 h-3" />
          </a>
          <a href={`mailto:${candidate.email}`} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            <Mail className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

interface KanbanColumnProps {
  status: StatusConfig;
  candidates: CandidateApplication[];
}

function KanbanColumn({ status, candidates }: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full min-w-[300px] w-full max-w-[350px]">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: status.color }}
          />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
            {status.labelEn}
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
            {candidates.length}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-2 min-h-[500px]">
        <SortableContext 
          id={status.key}
          items={candidates.map(c => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="h-full">
            <AnimatePresence>
              {candidates.map((candidate) => (
                <KanbanCard key={candidate.id} candidate={candidate} />
              ))}
            </AnimatePresence>
            {candidates.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl opacity-40">
                <p className="text-xs text-slate-400 font-medium">No candidates</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

interface CandidateKanbanProps {
  candidates: CandidateApplication[];
  statuses: StatusConfig[];
  onStatusChange: (candidateId: string, newStatus: string) => void;
}

export function CandidateKanban({ candidates, statuses, onStatusChange }: CandidateKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const candidateId = active.id as string;
    const overId = over.id as string;

    // Determine if we dropped on a column or another card
    const overStatus = statuses.find(s => s.key === overId);
    
    if (overStatus) {
      // Dropped on a column
      onStatusChange(candidateId, overStatus.key);
    } else {
      // Dropped on a card, find that card's status
      const overCandidate = candidates.find(c => c.id === overId);
      if (overCandidate && overCandidate.status !== candidates.find(c => c.id === candidateId)?.status) {
        onStatusChange(candidateId, overCandidate.status);
      }
    }
  };

  // Group candidates by status
  const groupedCandidates = statuses.reduce((acc, status) => {
    acc[status.key] = candidates.filter(c => c.status === status.key);
    return acc;
  }, {} as Record<string, CandidateApplication[]>);

  const activeCandidate = activeId ? candidates.find(c => c.id === activeId) : null;

  return (
    <div className="h-full overflow-x-auto pb-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 min-h-[600px] items-start">
          {statuses.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              candidates={groupedCandidates[status.key] || []}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCandidate ? (
            <div className="w-[300px] cursor-grabbing rotate-3 scale-105 shadow-xl">
              <KanbanCard candidate={activeCandidate} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
