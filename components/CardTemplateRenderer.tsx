'use client';

import { Card } from '@/types/card';
import ClassicTemplate from './card-templates/ClassicTemplate';
import MinimalTemplate from './card-templates/MinimalTemplate';
import AccentTemplate from './card-templates/AccentTemplate';
import LeftTemplate from './card-templates/LeftTemplate';
import CenteredTemplate from './card-templates/CenteredTemplate';

interface CardTemplateRendererProps {
  card: Card;
}

export default function CardTemplateRenderer({ card }: CardTemplateRendererProps) {
  switch (card.template) {
    case 'classic':
      return <ClassicTemplate person={card.person} theme={card.theme} />;
    case 'minimal':
      return <MinimalTemplate person={card.person} theme={card.theme} />;
    case 'accent':
      return <AccentTemplate person={card.person} theme={card.theme} />;
    case 'left':
      return <LeftTemplate person={card.person} theme={card.theme} />;
    case 'centered':
      return <CenteredTemplate person={card.person} theme={card.theme} />;
    default:
      return <ClassicTemplate person={card.person} theme={card.theme} />;
  }
}