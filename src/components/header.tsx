import { Logo } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  credits: number;
}

export default function Header({ credits }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6 text-accent" />
            <span className="font-bold font-headline text-lg sm:inline-block">
              ResearchPilot
            </span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Badge variant="outline" className="text-base font-normal border-accent/50">
            <span className="text-muted-foreground mr-2">Credits Used:</span>
            <span className="font-semibold text-accent">{credits}</span>
          </Badge>
        </div>
      </div>
    </header>
  );
}
