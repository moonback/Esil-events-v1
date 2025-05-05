import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Bot, Tag, MessageSquareText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import ProductMiniCard from '../ProductMiniCard';
import { ChatMessage } from '../../hooks/useChatMessages';

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-white/80 via-violet-50/20 to-violet-100/30 dark:from-gray-800/90 dark:via-gray-850/80 dark:to-gray-900/90 relative">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10 pointer-events-none"></div>
      <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-white/50 to-transparent dark:from-gray-800/50 pointer-events-none z-10"></div>
      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-violet-50/50 to-transparent dark:from-gray-900/50 pointer-events-none z-10"></div>
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div 
            key={message.id} 
            className={`mb-6 flex items-end gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            layout
          >
            {/* Avatar pour le bot */}
            {message.sender === 'bot' && (
              <motion.div 
                className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/40 ring-2 ring-white/80 dark:ring-gray-800/80 overflow-hidden relative group hover:shadow-xl hover:shadow-indigo-500/40 dark:hover:shadow-indigo-900/50 transition-all duration-300"
                initial={{ rotate: -15, scale: 0.8, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.15, rotate: 5 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 20,
                  mass: 1
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-purple-500/0 to-violet-500/0 group-hover:from-indigo-400/40 group-hover:via-purple-500/40 group-hover:to-violet-500/40 transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-grid-pattern opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                <MessageSquareText className="w-5 h-5 text-white relative z-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute -inset-2 bg-violet-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-violet-500/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              </motion.div>
            )}
            
            <motion.div 
              className={`relative max-w-[85%] transition-all transform ${
                message.sender === 'user'
                  ? 'bg-gradient-to-br from-gray-200 to-gray-200 text-white rounded-2xl rounded-br-none shadow-lg shadow-violet-500/20 dark:shadow-violet-900/30 border border-violet-500/20 backdrop-blur-sm'
                  : 'bg-white/95 dark:bg-gray-800/95 text-gray-800 dark:text-gray-100 border border-violet-200/50 dark:border-violet-800/30 rounded-2xl rounded-tl-none shadow-lg backdrop-blur-sm hover:border-violet-300/70 dark:hover:border-violet-700/50 transition-colors'
              } ${message.isNew ? 'message-new scale-100' : 'scale-100'} hover:shadow-xl transition-all duration-300 ease-in-out overflow-hidden`}
              whileHover={{ 
                scale: 1.02,
                translateY: -2
              }}
              layout
            >
              {/* Effet de brillance sur hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent hover:via-white/10 dark:hover:via-white/5 transition-all duration-700 ease-in-out bg-[length:0%_100%] hover:bg-[length:100%_100%] bg-no-repeat"></div>
              <div className="p-4">
                {message.sender === 'bot' && message.source && (
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-violet-100 dark:border-violet-800/30">
                    <div className="p-1 bg-violet-50 dark:bg-violet-900/20 rounded-md">
                      <svg className="w-3 h-3 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      via 
                      <span className="font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
                        {message.source === 'google' ? 'Google Gemini' : message.source === 'cache' ? 'Cache' : 'Fallback'}
                      </span>
                    </span>
                  </div>
                )}
                
                {/* Indicateur de chargement */}
                {isLoading && message.id === messages[messages.length - 1]?.id && message.sender === 'bot' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Loader2 className="w-4 h-4 text-violet-500 dark:text-violet-400 animate-spin" />
                    <span className="text-xs text-violet-500 dark:text-violet-400">Génération de la réponse...</span>
                  </div>
                )}
                <div className="relative">
                  <div className="text-xs/[1.5] sm:text-sm/[1.6] font-medium prose prose-sm max-w-none dark:prose-invert space-y-1.5 sm:space-y-2.5 markdown-content">
                    <ReactMarkdown 
                      rehypePlugins={[rehypeSanitize]}
                      components={{
                        // Personnalisation des titres
                        h1: ({node, ...props}: {node?: any, [key: string]: any}) => <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 my-3 pb-2 border-b border-gray-200 dark:border-gray-700" {...props} />,
                        h2: ({node, ...props}: {node?: any, [key: string]: any}) => <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 my-2.5" {...props} />,
                        h3: ({node, ...props}: {node?: any, [key: string]: any}) => <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 my-2" {...props} />,
                        h4: ({node, ...props}: {node?: any, [key: string]: any}) => <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100 my-1.5" {...props} />,
                        
                        // Personnalisation des paragraphes
                        p: ({node, ...props}: {node?: any, [key: string]: any}) => <p className="text-gray-700 dark:text-gray-200 leading-relaxed my-2" {...props} />,
                        
                        // Personnalisation des listes
                        ul: ({node, ...props}: {node?: any, [key: string]: any}) => <ul className="my-2 space-y-1 list-none pl-0" {...props} />,
                        ol: ({node, ...props}: {node?: any, [key: string]: any}) => <ol className="my-2 space-y-1 list-none pl-1" {...props} />,
                        li: ({node, children, ...props}: {node?: any, children?: React.ReactNode, [key: string]: any}) => {
                          const parentType = node?.parent?.type;
                          if (parentType === 'ul') {
                            return (
                              <li className="flex items-start gap-3 sm:gap-4 my-2 group hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-violet-100/30 dark:hover:from-violet-900/20 dark:hover:to-violet-800/20 p-3 rounded-2xl transition-all duration-300 ease-in-out border border-transparent hover:border-violet-200/50 dark:hover:border-violet-700/50 hover:shadow-lg hover:shadow-violet-100/20 dark:hover:shadow-violet-900/20" {...props}>
                                <div className="relative mt-1">
                                  <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-gradient-to-br from-violet-400 via-violet-500 to-violet-600 dark:from-violet-500 dark:via-violet-600 dark:to-violet-700 flex-shrink-0 group-hover:scale-125 group-hover:rotate-180 group-hover:shadow-xl group-hover:shadow-violet-400/30 dark:group-hover:shadow-violet-700/30 transition-all duration-500 ease-spring"></div>
                                  <div className="absolute -inset-2 bg-violet-400/20 dark:bg-violet-600/20 rounded-full blur-md opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300 -z-10"></div>
                                </div>
                                <span className="text-gray-700 dark:text-gray-200 flex-1 group-hover:translate-x-1 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-all duration-300">{children}</span>
                              </li>
                            );
                          } else {
                            return (
                              <li className="flex items-start gap-2 sm:gap-3 my-1.5 group hover:bg-gradient-to-r hover:from-violet-50/30 hover:to-violet-100/30 dark:hover:from-violet-900/20 dark:hover:to-violet-800/20 p-2 rounded-xl transition-all duration-300 ease-in-out border border-transparent hover:border-violet-200/50 dark:hover:border-violet-700/50 hover:shadow-lg hover:shadow-violet-100/20 dark:hover:shadow-violet-900/20" {...props}>
                                <div className="relative">
                                  <div className="text-xs sm:text-sm font-bold bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-400 dark:to-violet-600 bg-clip-text text-transparent flex-shrink-0 w-5 text-right group-hover:scale-110 transition-all duration-300">
                                    {(props as any).index + 1 || '•'}
                                  </div>
                                  <div className="absolute -inset-2 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                                </div>
                                <span className="text-gray-700 dark:text-gray-200 flex-1 group-hover:translate-x-1 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-all duration-300">{children}</span>
                              </li>
                            );
                          }
                        },
                        
                        // Personnalisation des tableaux
                        table: ({node, ...props}: {node?: any, [key: string]: any}) => (
                          <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full border-collapse" {...props} />
                          </div>
                        ),
                        thead: ({node, ...props}: {node?: any, [key: string]: any}) => <thead className="bg-gray-50 dark:bg-gray-800" {...props} />,
                        tbody: ({node, ...props}: {node?: any, [key: string]: any}) => <tbody className="divide-y divide-gray-200 dark:divide-gray-700" {...props} />,
                        tr: ({node, ...props}: {node?: any, [key: string]: any}) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors" {...props} />,
                        th: ({node, ...props}: {node?: any, [key: string]: any}) => <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-100 dark:bg-gray-800" {...props} />,
                        td: ({node, ...props}: {node?: any, [key: string]: any}) => <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700" {...props} />,
                        
                        // Personnalisation des liens
                        a: ({node, ...props}: {node?: any, [key: string]: any}) => <a className="text-violet-600 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300 underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                        
                        // Personnalisation du code
                        code: ({node, inline, ...props}: {node?: any, inline?: boolean, [key: string]: any}) => {
                          if (inline) {
                            return <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-violet-600 dark:text-violet-400 text-xs font-mono" {...props} />;
                          }
                          return <code className="block p-3 rounded-lg bg-gray-100 dark:bg-gray-800/80 text-gray-800 dark:text-gray-200 text-xs font-mono overflow-x-auto" {...props} />;
                        },
                        pre: ({node, ...props}: {node?: any, [key: string]: any}) => <pre className="my-3 rounded-lg bg-gray-100 dark:bg-gray-800/80 overflow-hidden" {...props} />,
                        
                        // Personnalisation des citations
                        blockquote: ({node, ...props}: {node?: any, [key: string]: any}) => <blockquote className="pl-4 border-l-4 border-violet-300 dark:border-violet-700 italic text-gray-600 dark:text-gray-300 my-3" {...props} />,
                        
                        // Personnalisation des séparateurs
                        hr: ({node, ...props}: {node?: any, [key: string]: any}) => <hr className="my-4 border-t border-gray-200 dark:border-gray-700" {...props} />,
                        
                        // Personnalisation des images
                        img: ({node, ...props}: {node?: any, [key: string]: any}) => <img className="max-w-full h-auto rounded-lg my-3 border border-gray-200 dark:border-gray-700" {...props} alt={props.alt || 'Image'} />,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                </div>
                
                {/* Afficher les produits mentionnés */}
                {message.mentionedProducts && message.mentionedProducts.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 bg-violet-50 dark:bg-violet-900/30 rounded-full">
                        <Tag className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                        Produits mentionnés
                      </span>
                    </div>
                    <motion.div 
                      className="flex flex-wrap gap-3"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {message.mentionedProducts.map(product => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ProductMiniCard product={product} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Avatar pour l'utilisateur */}
            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-gray-800">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Indicateur de chargement */}
      {isLoading && (
        <div className="flex items-end gap-2 mt-4">
          <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0v2.572a2.25 2.25 0 01-1.5 2.25m0 0c-1.283.918-2.617 1.843-4.5 2.25m0 0c-1.883-.407-3.217-1.332-4.5-2.25m0 0A2.25 2.25 0 013.75 19.5v-2.572a2.25 2.25 0 01.658-1.591L8.5 14.5" />
            </svg>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 rounded-2xl rounded-tl-none shadow-md">
            <div className="flex space-x-1.5">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 dark:bg-violet-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 dark:bg-violet-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 dark:bg-violet-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      {/* Élément invisible pour faire défiler vers le bas */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;