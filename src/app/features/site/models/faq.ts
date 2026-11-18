export type FaqLink = {
  label: string;
  path: string;
  fragment?: string;
};

export type FaqItem = {
  question: string;
  // Plain text only: the same paragraphs feed the FAQPage structured data.
  answer: string[];
  link?: FaqLink;
};

export type FaqGroup = {
  id: string;
  title: string;
  items: FaqItem[];
};
