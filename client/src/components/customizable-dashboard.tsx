import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Settings, GripVertical, Plus, X, Eye, EyeOff, ArrowLeft, Edit3, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { 
  AVAILABLE_WIDGETS,
  TodayBookingsWidget,
  RevenueWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  PerformanceWidget
} from "./dashboard-widgets";

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  enabled: boolean;
  position: number;
  size: 'small' | 'medium' | 'large';
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: '1', type: 'today-bookings', title: 'Today\'s Bookings', enabled: true, position: 0, size: 'medium' },
  { id: '2', type: 'revenue', title: 'Revenue Overview', enabled: true, position: 1, size: 'medium' },
  { id: '3', type: 'quick-stats', title: 'Quick Stats', enabled: true, position: 2, size: 'small' },
  { id: '4', type: 'recent-clients', title: 'Recent Clients', enabled: true, position: 3, size: 'medium' },
];

// Sortable Widget Wrapper
function SortableWidget({ widget, children }: { widget: DashboardWidget; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 150ms ease',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-2xl scale-105' : ''}`}
    >
      {children}
    </div>
  );
}

// Widget Customizer Panel
function WidgetCustomizer({ 
  widgets, 
  onToggleWidget, 
  onAddWidget, 
  onRemoveWidget 
}: {
  widgets: DashboardWidget[];
  onToggleWidget: (id: string) => void;
  onAddWidget: (type: string) => void;
  onRemoveWidget: (id: string) => void;
}) {
  const enabledWidgets = widgets.filter(w => w.enabled);
  const availableWidgetTypes = Object.keys(AVAILABLE_WIDGETS).filter(type => 
    !widgets.some(w => w.type === type && w.enabled)
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="w-4 h-4" />
          Customize Dashboard
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Dashboard Widgets</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Active Widgets */}
          <div>
            <h3 className="font-medium mb-3">Active Widgets</h3>
            <div className="space-y-2">
              {enabledWidgets.map((widget) => (
                <div key={widget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={widget.enabled}
                      onCheckedChange={() => onToggleWidget(widget.id)}
                    />
                    <span className="text-sm font-medium">{widget.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {widget.size}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveWidget(widget.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Available Widgets */}
          {availableWidgetTypes.length > 0 && (
            <div>
              <h3 className="font-medium mb-3">Available Widgets</h3>
              <div className="space-y-2">
                {availableWidgetTypes.map((type) => {
                  const widget = AVAILABLE_WIDGETS[type];
                  return (
                    <div key={type} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddWidget(type)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{widget.title}</span>
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function CustomizableDashboard() {
  const { toast } = useToast();
  const [isEditMode, setIsEditMode] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { id: '1', type: 'today-bookings', title: 'Today\'s Bookings', enabled: true, position: 0, size: 'medium' },
      { id: '2', type: 'revenue', title: 'Revenue Overview', enabled: true, position: 1, size: 'medium' },
      { id: '3', type: 'quick-stats', title: 'Quick Stats', enabled: true, position: 2, size: 'small' },
      { id: '4', type: 'recent-clients', title: 'Recent Clients', enabled: true, position: 3, size: 'medium' },
    ];
  });

  const getSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      default: return 'col-span-2';
    }
  };

  // Load dashboard configuration from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboard-config');
    if (savedConfig) {
      try {
        setWidgets(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to load dashboard config:', error);
        setDefaultWidgets();
      }
    } else {
      setDefaultWidgets();
    }
  }, []);

  // Save dashboard configuration to localStorage
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('dashboard-config', JSON.stringify(widgets));
    }
  }, [widgets]);

  const setDefaultWidgets = () => {
    const defaultWidgets: DashboardWidget[] = [
      { id: 'today-bookings-1', type: 'today-bookings', title: "Today's Bookings", enabled: true, position: 0, size: 'medium' },
      { id: 'revenue-1', type: 'revenue', title: 'Revenue', enabled: true, position: 1, size: 'medium' },
      { id: 'quick-actions-1', type: 'quick-actions', title: 'Quick Actions', enabled: true, position: 2, size: 'small' },
      { id: 'recent-activity-1', type: 'recent-activity', title: 'Recent Activity', enabled: true, position: 3, size: 'medium' },
      { id: 'performance-1', type: 'performance', title: 'Performance', enabled: true, position: 4, size: 'medium' },
    ];
    setWidgets(defaultWidgets);
  };

  const handleToggleWidget = (id: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
    ));
  };

  const handleAddWidget = (widgetType: string) => {
    const newWidget: DashboardWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: AVAILABLE_WIDGETS[widgetType].title,
      enabled: true,
      position: widgets.length,
      size: AVAILABLE_WIDGETS[widgetType].size as 'small' | 'medium' | 'large'
    };
    
    setWidgets(prev => [...prev, newWidget]);
    toast({
      title: "Widget Added",
      description: `${newWidget.title} has been added to your dashboard.`,
    });
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(prev => prev.filter(widget => widget.id !== id));
    toast({
      title: "Widget Removed",
      description: "Widget has been removed from your dashboard.",
    });
  };

  const renderWidget = (widget: DashboardWidget) => {
    const widgetConfig = AVAILABLE_WIDGETS[widget.type];
    if (!widgetConfig) {
      return (
        <div className={`${getSizeClass(widget.size)} h-64 bg-white rounded-lg border border-gray-200 p-4`}>
          <p className="text-center text-gray-500">Widget not found: {widget.type}</p>
        </div>
      );
    }

    const WidgetComponent = widgetConfig.component;
    
    return (
      <div className={`${getSizeClass(widget.size)} h-64 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 group ${isEditMode ? 'border-blue-200 shadow-sm' : ''}`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isEditMode && (
                <div className="text-gray-400 cursor-move">
                  <GripVertical className="h-4 w-4" />
                </div>
              )}
              <h3 className="text-sm font-medium text-gray-900">{widgetConfig.title}</h3>
            </div>
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveWidget(widget.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="flex-1">
            <WidgetComponent />
          </div>
        </div>
      </div>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWidgets((widgets) => {
        const oldIndex = widgets.findIndex((widget) => widget.id === active.id);
        const newIndex = widgets.findIndex((widget) => widget.id === over?.id);

        const reorderedWidgets = arrayMove(widgets, oldIndex, newIndex).map((widget, index) => ({
          ...widget,
          position: index
        }));

        return reorderedWidgets;
      });
    }
  };

  const enabledWidgets = widgets
    .filter(widget => widget.enabled)
    .sort((a, b) => a.position - b.position);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Monitor your barbershop performance</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsEditMode(!isEditMode)}
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              {isEditMode ? (
                <>
                  <Check className="w-4 h-4" />
                  Exit Edit
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  Edit Dashboard
                </>
              )}
            </Button>
            {isEditMode && (
              <WidgetCustomizer
                widgets={widgets}
                onToggleWidget={handleToggleWidget}
                onAddWidget={handleAddWidget}
                onRemoveWidget={handleRemoveWidget}
              />
            )}
          </div>
        </div>
      </div>

      {/* Widgets Grid */}
      <div className="p-6">
        {isEditMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <Edit3 className="w-4 h-4" />
              <span className="text-sm font-medium">Edit Mode Active</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Drag widgets to reorder them, click the X to remove, or use "Customize Dashboard" to add new widgets.
            </p>
          </div>
        )}
        
        {isEditMode ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={enabledWidgets.map(w => w.id)} 
              strategy={rectSortingStrategy}
            >
              <div className="widget-grid">
                {enabledWidgets.map((widget) => (
                  <SortableWidget key={widget.id} widget={widget}>
                    <div className="dashboard-widget">
                      {renderWidget(widget)}
                    </div>
                  </SortableWidget>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="widget-grid">
            {enabledWidgets.map((widget) => (
              <div key={widget.id} className="dashboard-widget">
                {renderWidget(widget)}
              </div>
            ))}
          </div>
        )}

        {enabledWidgets.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">No widgets enabled</h3>
                <p className="text-gray-600">Customize your dashboard by adding widgets</p>
              </div>
              <WidgetCustomizer
                widgets={widgets}
                onToggleWidget={handleToggleWidget}
                onAddWidget={handleAddWidget}
                onRemoveWidget={handleRemoveWidget}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}