-- Add attachment support to chat messages
ALTER TABLE chat_messages 
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT;

ALTER TABLE live_chat_messages 
ADD COLUMN attachment_url TEXT,
ADD COLUMN attachment_type TEXT;

-- Add comments
COMMENT ON COLUMN chat_messages.attachment_url IS 'URL to attached image or GIF';
COMMENT ON COLUMN chat_messages.attachment_type IS 'MIME type of the attachment';
COMMENT ON COLUMN live_chat_messages.attachment_url IS 'URL to attached image or GIF';
COMMENT ON COLUMN live_chat_messages.attachment_type IS 'MIME type of the attachment';