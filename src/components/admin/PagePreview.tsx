import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PagePreviewProps {
  title: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  title,
  content,
  meta_description,
  meta_keywords
}) => {
  return (
    <div className="page-preview bg-white rounded-lg shadow overflow-hidden">
      <Helmet>
        {meta_description && (
          <meta name="description" content={meta_description} />
        )}
        {meta_keywords && (
          <meta name="keywords" content={meta_keywords} />
        )}
      </Helmet>
      
      <div className="preview-header bg-gray-50 px-4 py-2 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-500">PRÉVISUALISATION</h3>
      </div>
      
      <div className="preview-content p-6">
        <h1 className="text-3xl font-bold mb-6 text-center tracking-tight">{title}</h1>
        <div className="max-w-3xl mx-auto">
          <div 
            className="prose prose-lg prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>
  );
};

export default PagePreview;