import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface SummaryTabProps {
  summary: {
    tldr: string;
    key_concepts: string[];
    definitions: { term: string; definition: string }[];
    bullet_summary: string[];
  } | null;
}

export function SummaryTab({ summary }: SummaryTabProps) {
  if (!summary) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        Summary not available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* TL;DR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="secondary">TL;DR</Badge>
          </CardTitle>
          <CardDescription>Quick overview in 5 lines or less</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">{summary.tldr}</p>
        </CardContent>
      </Card>

      {/* Key Concepts */}
      {summary.key_concepts && summary.key_concepts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Concepts</CardTitle>
            <CardDescription>Important ideas to remember</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {summary.key_concepts.map((concept, index) => (
                <Badge key={index} variant="outline" className="text-sm py-1 px-3">
                  {concept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Definitions */}
      {summary.definitions && summary.definitions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Important Definitions</CardTitle>
            <CardDescription>Key terms and their meanings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.definitions.map((def, index) => (
                <div key={index}>
                  <dt className="font-semibold text-primary">{def.term}</dt>
                  <dd className="text-muted-foreground mt-1">{def.definition}</dd>
                  {index < summary.definitions.length - 1 && (
                    <Separator className="mt-4" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bullet Summary */}
      {summary.bullet_summary && summary.bullet_summary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Points</CardTitle>
            <CardDescription>Main takeaways from the document</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {summary.bullet_summary.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center mr-3">
                    {index + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
