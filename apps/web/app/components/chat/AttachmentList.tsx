"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '@repo/db/convex/_generated/api';
import { useAppSelector } from '../../store/hooks';
import Image from 'next/image';

interface AttachmentListProps {
  messageId: string;
}

export default function AttachmentList({ messageId }: AttachmentListProps) {
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
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => (
        <div key={attachment.attachmentId}>
          <Image
            src={attachment.attachmentUrl}
            alt={attachment.fileName}
            className="max-w-[400px] rounded-lg object-contain w-auto h-auto"
            loading="lazy"
            width={300}
            height={300}
          />
        </div>
      ))}
    </div>
  );
} 