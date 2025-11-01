-- Fix incorrect reply_count values in forum_topics
UPDATE forum_topics
SET reply_count = (
  SELECT COUNT(*)
  FROM forum_replies
  WHERE forum_replies.topic_id = forum_topics.id
);
