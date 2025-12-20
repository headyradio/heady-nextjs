import Navigation from "@/components/Navigation";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Radio } from "lucide-react";

const Shows = () => {
  const nightTreatsShow = {
    title: "Night Treats",
    description: "Late night electronic music journey featuring deep house, progressive house, tech house, and experimental beats.",
    djs: [
      { name: "Rouxbais", image: "/assets/card1-rouxbais.webp" },
      { name: "Dale", image: "/assets/card2-dale.webp" }
    ],
    airTime: "Friday at 10:00 PM ET",
    replays: [
      "Fridays: 11:00 PM",
      "Saturdays: 12:00 AM, 1:00 AM, 3:00 AM",
      "Sundays: 1:00 AM"
    ],
    footer: "Night Treats airs every Friday night on HEADY.FM, with replays throughout the weekend."
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#0f0a1f]">
      <SEO
        title="Shows - HEADY.FM Programming Guide"
        description="Your guide to HEADY.FM programming. Discover Night Treats and other featured shows with DJ schedules, air times, and replays."
        url="https://heady.fm/shows"
        type="website"
      />
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200">
              Shows
            </h1>
            <p className="text-xl text-white/70">
              Your guide to HEADY.FM programming
            </p>
          </div>

          <Card className="shadow-2xl bg-white/5 backdrop-blur-sm border-2 border-white/10">
            <CardHeader className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-b border-white/10">
              <CardTitle className="text-3xl text-white">{nightTreatsShow.title}</CardTitle>
              <p className="text-lg text-white/80 mt-2">
                {nightTreatsShow.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-8 p-6 md:p-8">
              {/* DJs Section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-white">
                  <Radio className="h-5 w-5" />
                  Featured DJs
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {nightTreatsShow.djs.map((dj) => (
                    <div key={dj.name} className="flex items-center gap-4 p-4 bg-white/10 rounded-lg hover:bg-white/15 transition-all hover:scale-105">
                      <img 
                        src={dj.image} 
                        alt={dj.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-primary/30 shadow-lg"
                      />
                      <div>
                        <p className="font-bold text-xl text-white">{dj.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Air Times */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5" />
                  Air Times
                </h3>
                <Badge variant="secondary" className="text-base px-4 py-2 bg-primary/20 text-white border border-primary/30">
                  {nightTreatsShow.airTime}
                </Badge>
              </div>

              {/* Replays */}
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2 text-white">
                  <Clock className="h-5 w-5" />
                  Replays
                </h3>
                <ul className="space-y-2">
                  {nightTreatsShow.replays.map((replay, index) => (
                    <li key={index} className="text-white/80 flex items-center gap-2 text-base">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                      {replay}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-white/60 italic">
                  {nightTreatsShow.footer}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Shows;
