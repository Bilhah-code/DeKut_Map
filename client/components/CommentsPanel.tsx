import { useState } from "react";
import { Send, MessageCircle, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Comment {
  id: string;
  userName: string;
  message: string;
  timestamp: Date;
  rating?: number;
}

interface CommentsPanelProps {
  routeName?: string;
  onClose?: () => void;
}

export default function CommentsPanel({
  routeName = "Route",
  onClose,
}: CommentsPanelProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      userName: "Sarah K.",
      message:
        "Great navigation app! The routes are accurate and easy to follow.",
      timestamp: new Date(Date.now() - 3600000),
      rating: 5,
    },
    {
      id: "2",
      userName: "James M.",
      message:
        "Helpful for finding shortcuts across campus. Very intuitive interface.",
      timestamp: new Date(Date.now() - 7200000),
      rating: 4,
    },
  ]);
  const [newComment, setNewComment] = useState("");
  const [userName, setUserName] = useState("");
  const [rating, setRating] = useState(5);

  const handleAddComment = () => {
    if (newComment.trim() && userName.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        userName,
        message: newComment,
        timestamp: new Date(),
        rating,
      };
      setComments([comment, ...comments]);
      setNewComment("");
      setUserName("");
      setRating(5);
    }
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Header */}
      <div className="border-b-2 border-gray-200 bg-white p-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <MessageCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-gray-900">Route Feedback</h2>
            <p className="text-xs text-gray-500">{routeName}</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </Button>
        )}
      </div>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3 p-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
            <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium">No comments yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Be the first to share feedback about this route
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  {/* User and Rating */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {comment.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(comment.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  {comment.rating && (
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-sm ${
                            i < comment.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Comment Text */}
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {comment.message}
                  </p>
                </div>

                {/* Delete Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Section */}
      <div className="border-t-2 border-gray-200 bg-white p-4 flex-shrink-0">
        <div className="space-y-3">
          {/* User Name Input */}
          <Input
            placeholder="Your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="border-2 border-gray-200 focus:border-blue-500 rounded-lg h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const commentInput = document.querySelector(
                  'textarea[placeholder="Share your feedback..."]',
                ) as HTMLTextAreaElement;
                if (commentInput) commentInput.focus();
              }
            }}
          />

          {/* Rating */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-700">Rate:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-lg transition-colors ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment Input */}
          <div className="flex gap-2">
            <textarea
              placeholder="Share your feedback..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 border-2 border-gray-200 focus:border-blue-500 rounded-lg p-2.5 text-sm focus:outline-none resize-none"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleAddComment();
                }
              }}
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || !userName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 h-auto transition-all disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Press Ctrl+Enter to submit feedback
          </p>
        </div>
      </div>
    </div>
  );
}
