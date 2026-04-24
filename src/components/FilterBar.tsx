import { Search, Filter, Tag as TagIcon, X, Flag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PRIORITY_LABELS, type Priority } from "@/lib/tasks";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedPriority: Priority | null;
  setSelectedPriority: (p: Priority | null) => void;
  availableTags: string[];
}

export function FilterBar({ searchQuery, setSearchQuery, selectedTag, setSelectedTag, selectedPriority, setSelectedPriority, availableTags }: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4 mb-4 z-10 relative">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-50" />
        <Input 
          placeholder="Buscar tarefas..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-xl bg-card/60 backdrop-blur-md border-white/10 focus-visible:ring-primary/50 shadow-sm transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100">
             <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`h-12 px-4 rounded-xl border-white/10 bg-card/60 backdrop-blur-md shadow-sm transition-all font-semibold ${selectedPriority ? 'border-primary/50 text-primary' : ''}`}>
            {selectedPriority ? <Flag className="h-4 w-4 mr-2" /> : <Flag className="h-4 w-4 mr-2 opacity-70" />}
            {selectedPriority ? PRIORITY_LABELS[selectedPriority] : "Prioridade"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[180px] rounded-2xl bg-card/90 backdrop-blur-xl border-white/10 shadow-xl p-3">
           <h4 className="font-bold text-sm mb-3 px-2">Prioridade</h4>
           <div className="space-y-1">
             <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-lg h-9 text-sm ${!selectedPriority ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setSelectedPriority(null)}
             >
               Todas
             </Button>
             {(Object.keys(PRIORITY_LABELS) as Priority[]).map(p => (
               <Button 
                  key={p}
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg h-9 text-sm ${selectedPriority === p ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setSelectedPriority(p)}
               >
                 {PRIORITY_LABELS[p]}
               </Button>
             ))}
           </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={`h-12 px-4 rounded-xl border-white/10 bg-card/60 backdrop-blur-md shadow-sm transition-all font-semibold ${selectedTag ? 'border-primary/50 text-primary' : ''}`}>
            {selectedTag ? <TagIcon className="h-4 w-4 mr-2" /> : <Filter className="h-4 w-4 mr-2 opacity-70" />}
            {selectedTag ? selectedTag : "Tags"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-[200px] rounded-2xl bg-card/90 backdrop-blur-xl border-white/10 shadow-xl p-3">
           <h4 className="font-bold text-sm mb-3 px-2">Tags Disponíveis</h4>
           <div className="space-y-1">
             <Button 
                variant="ghost" 
                className={`w-full justify-start rounded-lg h-9 text-sm ${!selectedTag ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => setSelectedTag(null)}
             >
               Todas
             </Button>
             {availableTags.map(tag => (
               <Button 
                  key={tag}
                  variant="ghost" 
                  className={`w-full justify-start rounded-lg h-9 text-sm ${selectedTag === tag ? 'bg-primary/10 text-primary' : ''}`}
                  onClick={() => setSelectedTag(tag)}
               >
                 <TagIcon className="h-3 w-3 mr-2" /> {tag}
               </Button>
             ))}
           </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
