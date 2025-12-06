import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
}

export const FormattedText: React.FC<FormattedTextProps> = ({ text, className }) => {
  const parseMarkdown = (input: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;
    let key = 0;

    // Regex to match **bold** or *italic*
    // This matches ** followed by content, then ** OR * followed by content, then *
    const markdownRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
    let match;

    while ((match = markdownRegex.exec(input)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(
          <React.Fragment key={`text-${key++}`}>
            {input.substring(currentIndex, match.index)}
          </React.Fragment>
        );
      }

      // Check if it's bold (**text**) or italic (*text*)
      if (match[2]) {
        // Bold text (captured by group 2)
        parts.push(
          <strong key={`bold-${key++}`} className="font-bold text-foreground">
            {match[2]}
          </strong>
        );
      } else if (match[3]) {
        // Italic text (captured by group 3)
        parts.push(
          <em key={`italic-${key++}`} className="italic">
            {match[3]}
          </em>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text after last match
    if (currentIndex < input.length) {
      parts.push(
        <React.Fragment key={`text-${key++}`}>
          {input.substring(currentIndex)}
        </React.Fragment>
      );
    }

    return parts;
  };

  // Split by newlines to preserve paragraph structure
  const paragraphs = text.split('\n');

  return (
    <>
      {paragraphs.map((paragraph, index) => {
        if (paragraph.trim() === '') {
          return <br key={`br-${index}`} />;
        }
        return (
          <p key={`p-${index}`} className={className}>
            {parseMarkdown(paragraph)}
          </p>
        );
      })}
    </>
  );
};
