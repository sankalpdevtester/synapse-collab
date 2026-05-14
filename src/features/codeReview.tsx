```typescript
import React, { useState, useEffect } from 'react';
import { WebSocket } from 'ws';
import { OperationalTransform } from './operationalTransform';
import { CRDT } from './crdt';

interface CodeReviewComment {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
  replies: CodeReviewComment[];
}

interface CodeReviewProps {
  code: string;
  userId: string;
  userName: string;
}

const CodeReview: React.FC<CodeReviewProps> = ({ code, userId, userName }) => {
  const [comments, setComments] = useState<CodeReviewComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedComment, setSelectedComment] = useState<CodeReviewComment | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');
    ws.onmessage = (event) => {
      const comment: CodeReviewComment = JSON.parse(event.data);
      setComments((prevComments) => [...prevComments, comment]);
    };
  }, []);

  const handleCommentSubmit = () => {
    const comment: CodeReviewComment = {
      id: Math.random().toString(36).substr(2, 9),
      text: newComment,
      author: userName,
      createdAt: new Date(),
      replies: [],
    };
    setComments((prevComments) => [...prevComments, comment]);
    setNewComment('');
  };

  const handleReplySubmit = (commentId: string, replyText: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (comment) {
      comment.replies.push({
        id: Math.random().toString(36).substr(2, 9),
        text: replyText,
        author: userName,
        createdAt: new Date(),
        replies: [],
      });
      setComments([...comments]);
    }
  };

  const handleMention = (userId: string, userName: string) => {
    setNewComment(`${newComment} @${userName}`);
  };

  return (
    <div>
      <h2>Code Review</h2>
      <textarea value={code} readOnly />
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>
            <p>
              {comment.text} ({comment.author} at {comment.createdAt.toLocaleString()})
            </p>
            <ul>
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <p>
                    {reply.text} ({reply.author} at {reply.createdAt.toLocaleString()})
                  </p>
                </li>
              ))}
            </ul>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
            />
            <button onClick={handleCommentSubmit}>Submit</button>
            <button onClick={() => handleReplySubmit(comment.id, newComment)}>Reply</button>
            <button onClick={() => handleMention(userId, userName)}>Mention</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CodeReview;
```