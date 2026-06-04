import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { ChatRoom, ChatMessage, useListChatRooms, useListMessages, useSendChatMessage } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Hash, Users, AlertCircle, Info, Menu, MessageSquare, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { SkeletonLoader } from "./SkeletonLoader";

interface ChatInterfaceProps {
  className?: string;
}

const ROOM_ICON_CONFIG: Record<string, { icon: React.FC<any>; color: string; bg: string }> = {
  team:         { icon: Users,        color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/20" },
  announcement: { icon: AlertCircle,  color: "text-amber-400",   bg: "bg-amber-500/15 border-amber-500/20" },
  support:      { icon: Info,         color: "text-primary",     bg: "bg-primary/15 border-primary/20" },
  general:      { icon: Hash,         color: "text-muted-foreground", bg: "bg-white/5 border-white/10" },
};

function getRoomConfig(type: string) {
  return ROOM_ICON_CONFIG[type] || ROOM_ICON_CONFIG.general;
}

export function ChatInterface({ className }: ChatInterfaceProps) {
  const { user } = useAuthStore();
  const { rooms, activeRoomId, setRooms, setActiveRoom } = useChatStore();
  const [content, setContent] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: roomsData, isLoading: roomsLoading } = useListChatRooms({
    query: { refetchInterval: 5000 } as any,
  });

  const { data: messagesData, isLoading: messagesLoading } = useListMessages(
    activeRoomId || 0,
    {
      query: {
        enabled: !!activeRoomId,
        refetchInterval: 3000,
      } as any,
    }
  );

  const sendMessage = useSendChatMessage();

  useEffect(() => {
    const rooms = roomsData as ChatRoom[] | undefined;
    if (rooms && rooms.length > 0) {
      setRooms(rooms);
      if (!activeRoomId) {
        setActiveRoom(rooms[0].id);
      }
    }
  }, [roomsData, activeRoomId, setRooms, setActiveRoom]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesData, activeRoomId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !activeRoomId || !user) return;
    const messageContent = content;
    setContent("");
    try {
      await sendMessage.mutateAsync({
        roomId: activeRoomId,
        data: { content: messageContent },
      });
    } catch {
      setContent(messageContent);
    }
  };

  const activeMessages = (messagesData as ChatMessage[] | undefined) || [];
  const activeRoom = rooms.find((r: ChatRoom) => r.id === activeRoomId);

  return (
    <div className={cn(
      "flex h-[calc(100vh-120px)] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl",
      "bg-gradient-to-br from-[hsl(228_84%_3%)] via-[hsl(228_60%_4%)] to-[hsl(228_84%_2.5%)]",
      className
    )}>

      {/* ── Channel Sidebar ── */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="flex flex-col border-r border-white/[0.07] bg-black/30 backdrop-blur-sm overflow-hidden shrink-0"
          >
            {/* Sidebar header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.07] shrink-0 bg-black/20">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                  <MessageSquare size={13} className="text-primary" />
                </div>
                <h2 className="font-bold text-sm tracking-tight">Channels</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft size={16} />
              </Button>
            </div>

            {/* Channel list */}
            <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
              {roomsLoading ? (
                <div className="space-y-1.5 px-2 pt-2">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonLoader key={i} className="h-9 w-full rounded-lg" />
                  ))}
                </div>
              ) : rooms.map((room: ChatRoom) => {
                const cfg = getRoomConfig(room.type);
                const RoomIcon = cfg.icon;
                const isActive = activeRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => setActiveRoom(room.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-sm group relative",
                      isActive
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-white/[0.05] hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="channel-active"
                        className="absolute inset-0 rounded-xl bg-primary/12 border border-primary/20"
                        transition={{ type: "spring", bounce: 0.12, duration: 0.35 }}
                      />
                    )}
                    <div className={cn(
                      "w-6 h-6 rounded-md flex items-center justify-center shrink-0 border relative z-10",
                      isActive ? "bg-primary/20 border-primary/30" : `${cfg.bg}`
                    )}>
                      <RoomIcon size={12} className={isActive ? "text-primary" : cfg.color} />
                    </div>
                    <div className="flex-1 text-left truncate relative z-10 font-medium text-[13px]">
                      {room.name}
                    </div>
                    {(room as ChatRoom & { unreadCount?: number }).unreadCount ? (
                      <div className="shrink-0 relative z-10 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {(room as ChatRoom & { unreadCount?: number }).unreadCount}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {/* User footer */}
            <div className="p-3 border-t border-white/[0.07] bg-black/20">
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl">
                <div className="relative">
                  <Avatar className="h-7 w-7 border border-primary/30">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                      {user?.name?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-background" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{user?.name || "You"}</p>
                  <p className="text-[10px] text-emerald-400">Online</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="h-14 flex items-center px-4 border-b border-white/[0.07] shrink-0 bg-black/20 backdrop-blur-sm gap-3">
          {!isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
            >
              <Menu size={16} />
            </Button>
          )}
          {activeRoom ? (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center border shrink-0",
                getRoomConfig(activeRoom.type).bg
              )}>
                {(() => {
                  const cfg = getRoomConfig(activeRoom.type);
                  const Icon = cfg.icon;
                  return <Icon size={13} className={cfg.color} />;
                })()}
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm truncate block">{activeRoom.name}</span>
              </div>
              <div className="ml-auto flex items-center gap-1.5 shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">Select a channel</span>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {!activeRoomId ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto">
                  <MessageSquare className="w-7 h-7 text-muted-foreground opacity-40" />
                </div>
                <p className="text-muted-foreground text-sm">Select a channel to start messaging</p>
              </div>
            </div>
          ) : messagesLoading ? (
            <div className="flex flex-col gap-4 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={cn("flex gap-3 max-w-[75%]", i % 2 === 0 ? "self-start" : "self-end flex-row-reverse")}>
                  <SkeletonLoader className="w-8 h-8 rounded-full shrink-0" />
                  <SkeletonLoader className={cn("h-12 rounded-2xl", i % 3 === 0 ? "w-56" : "w-40")} />
                </div>
              ))}
            </div>
          ) : activeMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
                  <Hash className="w-6 h-6 text-primary opacity-60" />
                </div>
                <p className="text-muted-foreground text-sm">No messages yet — be the first!</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-end min-h-full pt-4">
              <AnimatePresence initial={false}>
                {activeMessages.map((msg: ChatMessage, idx: number) => {
                  const isMe = msg.senderId === user?.id;
                  const prev = activeMessages[idx - 1];
                  const showHeader = idx === 0
                    || prev.senderId !== msg.senderId
                    || new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() > 300000;

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-3 max-w-[80%]",
                        isMe ? "self-end flex-row-reverse" : "self-start",
                        showHeader ? "mt-4" : "mt-0.5"
                      )}
                    >
                      {/* Avatar */}
                      {showHeader ? (
                        <Avatar className="w-8 h-8 shrink-0 border border-white/10 mt-0.5">
                          <AvatarImage src={(msg as ChatMessage & { senderAvatar?: string }).senderAvatar || undefined} />
                          <AvatarFallback className={cn(
                            "text-[10px] font-bold",
                            isMe ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                          )}>
                            {(msg as ChatMessage & { senderName?: string }).senderName?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 shrink-0" />
                      )}

                      <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                        {showHeader && (
                          <div className={cn("flex items-baseline gap-2 mb-1.5 px-1", isMe && "flex-row-reverse")}>
                            <span className="text-xs font-semibold">
                              {isMe ? "You" : (msg as ChatMessage & { senderName?: string }).senderName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(new Date(msg.createdAt), "HH:mm")}
                            </span>
                          </div>
                        )}
                        <div className={cn(
                          "px-3.5 py-2 text-sm break-words relative group max-w-full",
                          isMe
                            ? [
                                "bg-primary text-white",
                                "rounded-2xl rounded-tr-sm",
                                "shadow-[0_4px_20px_rgba(65,130,255,0.2)]"
                              ].join(" ")
                            : [
                                "bg-white/[0.07] text-foreground",
                                "rounded-2xl rounded-tl-sm",
                                "border border-white/[0.07]"
                              ].join(" ")
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 shrink-0 border-t border-white/[0.07] bg-black/20">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  activeRoom
                    ? `Message #${activeRoom.name}…`
                    : "Select a channel to chat…"
                }
                disabled={!activeRoomId || sendMessage.isPending}
                className="h-11 bg-white/[0.05] border-white/[0.1] focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-xl pr-12 text-sm placeholder:text-muted-foreground/60"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!content.trim() || !activeRoomId || sendMessage.isPending}
                className={cn(
                  "absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg transition-all",
                  content.trim() && activeRoomId
                    ? "bg-primary text-white shadow-[0_0_15px_rgba(65,130,255,0.4)] hover:shadow-[0_0_25px_rgba(65,130,255,0.5)]"
                    : "bg-white/5 text-muted-foreground"
                )}
              >
                <Send size={14} />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
