'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function MarkdownRenderer({ content }: { content: string }) {
  return (
    <section
      className="prose prose-neutral mx-auto w-full max-w-[68ch]
             text-[17px] sm:text-[18px] leading-8 sm:leading-9 mt-6
             prose-headings:tracking-tight prose-headings:font-semibold
             prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4
             prose-h3:text-xl sm:prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-3
             prose-p:mt-7 sm:prose-p:mt-8
             [&amp;>p:first-of-type]:text-[18px] sm:[&amp;>p:first-of-type]:text-[19px]
             [&amp;>p:first-of-type]:leading-9 sm:[&amp;>p:first-of-type]:leading-10
             [&amp;>p:first-of-type]:text-gray-600
             [&amp;>p:first-of-type]:mt-6 [&amp;>p:first-of-type]:mb-6 sm:[&amp;>p:first-of-type]:mb-7
             prose-ul:my-6 sm:my-7 prose-ol:my-6 sm:my-7 prose-li:leading-9
             prose-a:no-underline hover:prose-a:underline prose-a:underline-offset-4
             prose-hr:my-10
             prose-blockquote:border-l-4 prose-blockquote:border-gray-200
             prose-blockquote:bg-gray-50 prose-blockquote:rounded-md
             prose-blockquote:pl-4 prose-blockquote:py-3 prose-blockquote:italic
             prose-img:rounded-lg prose-img:shadow-sm prose-img:my-8"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Keep links safe & consistent
          a: (props: any) => (
            <a
              {...props}
              target={props.target ?? '_blank'}
              rel={props.rel ?? 'noopener noreferrer'}
            />
          ),
          // Lazy-load images by default
          img: (props: any) => <img {...props} loading="lazy" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </section>
  )
}