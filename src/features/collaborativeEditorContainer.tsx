import React from 'react';
import { CollaborativeEditor } from 'src/features/collaborativeEditor';
import { Document } from 'src/utils/documentSync';

interface CollaborativeEditorContainerProps {
  document: Document;
}

const CollaborativeEditorContainer: React.FC<CollaborativeEditorContainerProps> = ({ document }) => {
  return (
    <div>
      <CollaborativeEditor document={document} />
    </div>
  );
};

export { CollaborativeEditorContainer };