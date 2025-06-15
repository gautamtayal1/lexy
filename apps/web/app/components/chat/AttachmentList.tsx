"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import { useAppSelector } from '../../store/hooks';
import Image from 'next/image';

interface AttachmentListProps {
  messageId: string;
  messageRole: 'user' | 'assistant' | 'system';
}

export default function AttachmentList({ messageId, messageRole }: AttachmentListProps) {
  const theme = useAppSelector((state) => state.theme.theme);
  
  // Only query if messageId exists and is not empty
  const attachments = useQuery(
    api.attachments.getAttachmentsByMessageId, 
    messageId && messageId.trim() !== "" ? { messageId } : "skip"
  );

  if (!messageId || !attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className={`mt-3 space-y-2 ${messageRole === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
      {attachments.map((attachment) => (
        <div key={attachment.attachmentId} className={messageRole === 'user' ? 'max-w-[300px]' : 'max-w-[400px]'}>
          <Image
            src={attachment.attachmentUrl}
            alt={attachment.fileName}
            className={`rounded-lg object-contain w-auto h-auto ${
              messageRole === 'user' 
                ? 'max-w-[300px] max-h-[300px]' 
                : 'max-w-[400px] max-h-[400px]'
            }`}
            loading="lazy"
            width={messageRole === 'user' ? 250 : 300}
            height={messageRole === 'user' ? 250 : 300}
          />
        </div>
      ))}
    </div>
  );
} 