import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Radio } from 'lucide-react';

interface DJ {
  id: string;
  name: string;
  nickname: string;
  bio: string;
  specialty: string;
  initials: string;
  color: string;
}

const DJS: DJ[] = [
  {
    id: '1',
    name: 'DJ Nebula',
    nickname: 'The Cosmic Voyager',
    bio: 'Exploring the depths of psychedelic soundscapes since 2015. Broadcasting from the edge of the known universe.',
    specialty: 'Psychedelic & Ambient',
    initials: 'DN',
    color: 'hsl(var(--primary))',
  },
  {
    id: '2',
    name: 'DJ Stardust',
    nickname: 'Soul Architect',
    bio: 'Bringing the funk and soul from galaxies far and wide. Keeper of the groove, master of the vibe.',
    specialty: 'Funk, Soul & R&B',
    initials: 'DS',
    color: 'hsl(var(--secondary))',
  },
  {
    id: '3',
    name: 'DJ Cosmos',
    nickname: 'The Archivist',
    bio: 'Digging through the crates of time and space. Curator of forgotten frequencies and rare transmissions.',
    specialty: 'Rare Grooves & World',
    initials: 'DC',
    color: 'hsl(var(--success))',
  },
  {
    id: '4',
    name: 'DJ Astro',
    nickname: 'Beat Commander',
    bio: 'Commanding the beats from the underground to the stratosphere. Hip-hop transmissions for the enlightened.',
    specialty: 'Hip-Hop & Beats',
    initials: 'DA',
    color: 'hsl(var(--burgundy))',
  },
];

export const DJProfiles = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="display-lg mb-4">Meet the Transmitters</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our crew of cosmic DJs broadcasting from the mothership
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DJS.map((dj) => (
            <Card key={dj.id} className="border-bold hover-lift p-6 text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24 border-4 border-border">
                  <AvatarFallback
                    className="text-2xl font-black"
                    style={{ backgroundColor: dj.color }}
                  >
                    {dj.initials}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h3 className="text-xl font-black mb-1">{dj.name}</h3>
                  <p className="text-sm text-secondary font-bold mb-2">{dj.nickname}</p>
                  <p className="text-xs text-muted-foreground mb-3">{dj.specialty}</p>
                </div>

                <p className="text-sm text-foreground/80 line-clamp-3">
                  {dj.bio}
                </p>

                <Button variant="outline" size="sm" className="w-full">
                  <Radio className="h-4 w-4 mr-2" />
                  View Shows
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
