import React, { useState, useEffect, useRef } from 'react';

/**
 * CharacterSelector
 *
 * Full-screen modal for browsing and selecting characters to insert into prompts.
 * - Loads characters from public/image-studio/characters/
 * - Visual preview cards with character details
 * - Click to insert character description at cursor position
 * - Search functionality across character names and attributes
 *
 * Phase 3 Integration: Will connect to CharacterPromptTransformer and object library
 */

interface Character {
  id: string;
  name: string;
  description: string;
  attributes: {
    appearance?: string;
    clothing?: string;
    personality?: string;
    age?: string;
    gender?: string;
  };
  imageUrl?: string;
  tags: string[];
}

interface CharacterSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (description: string) => void;
}

export const CharacterSelector: React.FC<CharacterSelectorProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
}) => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for focus management
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load characters on mount
  useEffect(() => {
    if (isOpen) {
      loadCharacters();
      // Auto-focus search input when modal opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape to close
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const loadCharacters = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Week 2 MVP: Hardcoded starter characters
      // Phase 3: Will load from database via CharacterPromptTransformer
      const starterCharacters: Character[] = [
        {
          id: 'cyberpunk-samurai',
          name: 'Cyberpunk Samurai',
          description:
            'A lone warrior in neon-lit urban landscape, traditional samurai armor integrated with cybernetic enhancements, glowing blue circuit patterns, katana with energy blade',
          attributes: {
            appearance: 'Asian features, cybernetic eye implant, battle-scarred',
            clothing: 'Modified samurai armor with LED strips, tactical vest',
            personality: 'Stoic, disciplined, haunted by past',
            age: '30s',
            gender: 'Male',
          },
          tags: ['cyberpunk', 'samurai', 'warrior', 'sci-fi', 'neon'],
        },
        {
          id: 'space-explorer',
          name: 'Space Explorer',
          description:
            'Intrepid astronaut in advanced spacesuit, transparent helmet revealing determined expression, equipped with scanning devices and sample containers, standing on alien planet surface',
          attributes: {
            appearance: 'Caucasian, short hair, focused gaze',
            clothing: 'White and orange spacesuit with mission patches, utility belt',
            personality: 'Curious, brave, methodical',
            age: '40s',
            gender: 'Female',
          },
          tags: ['sci-fi', 'space', 'astronaut', 'explorer', 'futuristic'],
        },
        {
          id: 'fantasy-mage',
          name: 'Fantasy Mage',
          description:
            'Powerful sorcerer in flowing robes adorned with mystical runes, staff crackling with magical energy, ancient tome floating nearby, ethereal glow surrounding figure',
          attributes: {
            appearance: 'Elderly, long white beard, wise eyes',
            clothing: 'Deep purple robes with gold trim, pointed hat with stars',
            personality: 'Wise, enigmatic, protective',
            age: '70s',
            gender: 'Male',
          },
          tags: ['fantasy', 'magic', 'wizard', 'mystical', 'medieval'],
        },
        {
          id: 'post-apocalyptic-survivor',
          name: 'Post-Apocalyptic Survivor',
          description:
            'Resilient scavenger in makeshift armor cobbled from salvaged materials, gas mask hanging from belt, backpack filled with supplies, standing in ruined cityscape',
          attributes: {
            appearance: 'Weathered features, scars, protective goggles',
            clothing: 'Layered tactical gear, leather jacket, combat boots',
            personality: 'Resourceful, cautious, determined',
            age: '20s',
            gender: 'Female',
          },
          tags: ['post-apocalyptic', 'survivor', 'scavenger', 'dystopia', 'wasteland'],
        },
        {
          id: 'steampunk-inventor',
          name: 'Steampunk Inventor',
          description:
            'Ingenious engineer in Victorian-era clothing modified with brass gears and clockwork mechanisms, leather apron with tool pouches, mechanical arm prosthetic, surrounded by intricate inventions',
          attributes: {
            appearance: 'Middle-aged, goggles on forehead, oil-stained hands',
            clothing: 'Vest with watch chains, rolled-up sleeves, leather gloves',
            personality: 'Creative, eccentric, passionate',
            age: '50s',
            gender: 'Male',
          },
          tags: ['steampunk', 'inventor', 'victorian', 'clockwork', 'engineer'],
        },
        {
          id: 'nature-guardian',
          name: 'Nature Guardian',
          description:
            'Mystical protector of the forest, clothing woven from leaves and vines, staff made of living wood, surrounded by glowing butterflies and forest animals, ethereal green aura',
          attributes: {
            appearance: 'Elvish features, flowing hair with flowers, gentle eyes',
            clothing: 'Organic dress of moss and petals, bare feet',
            personality: 'Peaceful, wise, fiercely protective',
            age: '20s (appears)',
            gender: 'Female',
          },
          tags: ['fantasy', 'nature', 'guardian', 'elf', 'magical'],
        },
      ];

      setCharacters(starterCharacters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load characters');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter characters by search query
  const filteredCharacters = characters.filter((char) => {
    if (searchQuery === '') return true;

    const query = searchQuery.toLowerCase();
    return (
      char.name.toLowerCase().includes(query) ||
      char.description.toLowerCase().includes(query) ||
      char.tags.some((tag) => tag.toLowerCase().includes(query)) ||
      Object.values(char.attributes).some((attr) =>
        attr?.toLowerCase().includes(query)
      )
    );
  });

  const handleSelectCharacter = (character: Character) => {
    // Format character description for insertion
    const formattedDescription = `${character.description}

Character Details:
- Appearance: ${character.attributes.appearance || 'Not specified'}
- Clothing: ${character.attributes.clothing || 'Not specified'}
- Age: ${character.attributes.age || 'Not specified'}
- Gender: ${character.attributes.gender || 'Not specified'}`;

    onSelectCharacter(formattedDescription);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg max-w-6xl w-full max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">Character Selector</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Select a character to insert into your prompt
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-zinc-800">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search characters by name, description, or tags..."
              className="w-full bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                <p className="text-sm text-zinc-500">Loading characters...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!isLoading && !error && filteredCharacters.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-zinc-700 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <p className="text-sm text-zinc-500">
                  {searchQuery
                    ? 'No characters match your search'
                    : 'No characters available yet'}
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredCharacters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map((char) => (
                <button
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  className="bg-zinc-800 border border-zinc-700 hover:border-amber-500 rounded-lg p-4 text-left transition-all group hover:bg-zinc-750"
                >
                  {/* Character Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-base font-medium text-zinc-200 group-hover:text-amber-400 transition-colors mb-1">
                        {char.name}
                      </h3>
                      <div className="flex items-center gap-1 flex-wrap">
                        {char.tags.slice(0, 3).map((tag, i) => (
                          <span
                            key={i}
                            className="text-xs bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors flex-shrink-0 ml-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-zinc-400 line-clamp-3 mb-3">
                    {char.description}
                  </p>

                  {/* Attributes Grid */}
                  <div className="space-y-1">
                    {char.attributes.appearance && (
                      <div className="text-xs">
                        <span className="text-zinc-500">Appearance:</span>{' '}
                        <span className="text-zinc-400">{char.attributes.appearance}</span>
                      </div>
                    )}
                    {char.attributes.clothing && (
                      <div className="text-xs">
                        <span className="text-zinc-500">Clothing:</span>{' '}
                        <span className="text-zinc-400">{char.attributes.clothing}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-500">
            {filteredCharacters.length} character{filteredCharacters.length !== 1 ? 's' : ''}{' '}
            available
            <span className="text-zinc-600 ml-2">
              Phase 3: Will connect to object library
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-sm bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-4 py-2 rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
