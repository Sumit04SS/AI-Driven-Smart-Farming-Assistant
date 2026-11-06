import React from 'react';
import { Bell, Check, CheckCheck, Clock, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Button } from '../common/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">{unreadCount} unread alert{unreadCount === 1 ? '' : 's'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 stroke-1 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">No notifications yet</p>
                <p className="text-xs mt-1 text-slate-400">Price alerts and rental updates will show up here.</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border text-sm transition-all duration-150 ${
                    item.is_read
                      ? 'bg-slate-50/60 border-slate-200/60 text-slate-600'
                      : 'bg-white border-emerald-200 shadow-xs text-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-semibold text-xs text-slate-900 leading-snug">
                      {item.title}
                    </h4>
                    {!item.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.message}</p>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!item.is_read && (
                      <button
                        onClick={() => markAsRead(item.id)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  notifications.filter(n => !n.is_read).forEach(n => markAsRead(n.id));
                }}
                disabled={unreadCount === 0}
                icon={<CheckCheck className="w-3.5 h-3.5" />}
              >
                Mark all as read
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
