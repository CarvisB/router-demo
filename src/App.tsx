import React, { useEffect, useReducer, useState, type JSX } from 'react'
import { Routes, Route, Link, Outlet, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { useParams } from 'react-router-dom'
import './App.css'

type PokedexContextType = {
  favorites: number[];
  addFavorite: (id:number) => void;
  removeFavorite: (id:number) => void;
}

  export const TYPE_COLORS: Record<string, string> = {
  fire: "#F08030",
  water: "#6890F0",
  grass: "#78C850",
  electric: "#F8D030",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
  normal: "#A8A878",
  };

function TypeBadge({ type }: { type: string }) {
  const icons: Record<string, string> = {
    fire: "🔥",
    water: "💧",
    grass: "🍃",
    electric: "⚡",
    ice: "❄️",
    fighting: "🥊",
    poison: "☠️",
    ground: "🟤",
    flying: "🕊️",
    psychic: "🔮",
    bug: "🐛",
    rock: "🪨",
    ghost: "👻",
    dragon: "🐉",
    dark: "🌙",
    steel: "⚙️",
    fairy: "✨",
    normal: "⚪",
  };


  return (
    <span
      style={{
        backgroundColor: TYPE_COLORS[type] || "#AAA",
        padding: "0.3rem 0.6rem",
        borderRadius: "12px",
        color: "white",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        fontSize: "0.9rem",
        textTransform: "capitalize",
      }}
    >
      {icons[type] || "?"} {type}
    </span>
  );
}


export const PokedexContext = React.createContext<PokedexContextType | null>(null)

type FavoritesAction = 
 | {type: "ADD_FAVORITE"; payload: number }
 | {type: "REMOVE_FAVORITE"; payload: number }
 | {type: "LOAD_SAVED"; payload: number[]};

function favoritesReducer(state: number[], action: FavoritesAction): number[] {
  switch(action.type) {
    case "ADD_FAVORITE":
      return state.includes(action.payload)
      ? state : [...state, action.payload];

    case "REMOVE_FAVORITE":
      return state.filter(id => id !== action.payload);

    case "LOAD_SAVED":
      return action.payload;

    default: 
    return state;
  }
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [favorites, dispatch] = useReducer(favoritesReducer, []);
 

useEffect(() => {
  const saved = localStorage.getItem("favorites");
  if (saved) {
    dispatch({ type: "LOAD_SAVED", payload: JSON.parse(saved) });
  }
  }, []); // <-- empty array means run ONCE
  
useEffect(() => {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}, [favorites]);


  function ProtectedRoute({ isLoggedIn, children}: { isLoggedIn: boolean; children: JSX.Element }) {
    if (!isLoggedIn) {
      return <Navigate to='/' replace />
    }
    return children
  }

  function removeFavorite(id:number): void {
   dispatch({ type: "REMOVE_FAVORITE", payload: id })
  }


  function addFavorite(id: number): void {
    dispatch({ type: "ADD_FAVORITE", payload: id });
  }


  return (
    <>
        <PokedexContext.Provider value={{ favorites, addFavorite, removeFavorite }}>
          <nav style={{ display: "flex", gap: "1rem", padding: "1rem" }}>
            <Link to="/">Home</Link>
            <Link to="/pokedex"> Pokedex</Link>
            <Link to="/favorites">Favorites</Link>
            <Link to="/help">Help</Link>
            <button onClick={() => setLoggedIn(true)}>Log In</button>
            <button onClick={() => setLoggedIn(false)}>Log Out</button>
          </nav>

          <Routes>
            <Route path='/' element={<Home />} />

            <Route path='/pokedex' element={<Pokedex />}>
              <Route path="fire" element={<FirePokemon />} />
              <Route path="water" element={<WaterPokemon />} />
              <Route path="grass" element={<GrassPokemon />}/>
              <Route path="normal" element={<NormalPokemon />} />
              <Route path="electric" element={<ElectricPokemon />} />
              <Route path="ice" element={<IcePokemon />} />
              <Route path="fighting" element={<FightingPokemon />} />
              <Route path="poison" element={<PoisonPokemon />} />
              <Route path="ground" element={<GroundPokemon/>} />
              <Route path="flying" element={<FlyingPokemon/>} />
              <Route path="psychic" element={<PsychicPokemon/>} />
              <Route path="bug" element={<BugPokemon />} />
              <Route path="rock" element={<RockPokemon />} />
              <Route path="ghost" element={<GhostPokemon />} />
              <Route path="dragon" element={<DragonPokemon />} />
              <Route path="dark" element={<DarkPokemon />} />
              <Route path="steel" element={<SteelPokemon />} />
              <Route path="fairy" element={<FairyPokemon />} />
            </Route>

            <Route 
              path='/favorites'
              element={
              <ProtectedRoute isLoggedIn={loggedIn}>
                <Favorites />
            </ProtectedRoute>
            } />
            <Route path='/help' element={<Help />} />
            <Route 
              path='/pokemon/:id' 
              element={<PokemonDetails />} />
            {/*The * path should always be last to route any unknown pages. */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </PokedexContext.Provider>
    </>
  )
}

  function Home() {
    const navigate = useNavigate();

    return ( 
      <>
        <h1>Home Page</h1>
        <button onClick={() => navigate("/pokedex")}>
          Go to Pokedex
        </button>
      </>
    )
  }

  function Pokedex(): JSX.Element {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState("");
    const [pokemonList, setPokemonList] = useState<{name: string; id: number; sprite: string; types: string[];}[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState(1);
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");
    const [sortBy, setSortBy] = useState<"id-asc" | "id-desc" | "name-asc" | "name-desc">("id-asc");

    const pageSize = 20;
    const type: string | null = searchParams.get("type");
    console.log(type)

    useEffect(() => {
      async function loadPokemon() {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1025`);
          const data = await res.json();

          const detailed = await Promise.all(
            data.results.map(async(p: any) => {
              const pokemonRes = await fetch(p.url);
              const pokemonData = await pokemonRes.json();

              return {
                id: pokemonData.id,
                name: pokemonData.name,
                sprite: pokemonData.sprites.front_default,
                types: pokemonData.types.map((t: any) => t.type.name),
              }
            })
          )

          setPokemonList(detailed);
        } catch (e) {
          console.error("Failed to fetch Pokemon", e);
        } finally {
          setLoading(false);
        }
      }

      loadPokemon();
    }, [])

    useEffect(() => {
      setPage(1);
    }, [search]);

    useEffect(() =>{
      setPage(1);
    }, [type])

     const filt = pokemonList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
    );

    const typeFiltered = type 
  ? filt.filter(p => p.types.includes(type))
  : filt;

  const sorted = [...typeFiltered].sort((a, b) => {
    switch(sortBy) {
      case "id-asc":
        return a.id - b.id;
      case "id-desc":
        return b.id - a.id;
      case "name-asc": 
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  })

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const paginated = sorted.slice(start, end);
  const totalPages = Math.ceil(sorted.length / pageSize);


    
    // Read type from URL (?type=value)
    
    // Helper for setting params (fully typed)
    function setType(value: string): void {
      if(value === "") {
        //Clear all query params
        setSearchParams({});
      } else {
        setSearchParams({ type: value })
      }
    }

    if(loading)
      return(
      <>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {Array.from({ length: 20 }).map((_,i) => (
            <PokemonSkeleton key={i} />
          ))}
        </ul>
      </>
      )

    return (
    <>
      <h1>Pokedex Pages</h1>

      <button onClick={() => navigate("/")}>
        Home
      </button>

      <input 
        className='poke-search'
        type='text'
        placeholder='Search Pokemon...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div style={{ margin: "1rem 0" }}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={{ padding: "0.5rem", borderRadius: "6px" }}
        >
          <option value="id-asc">ID ↑ (1 → 1025)</option>
          <option value="id-desc">ID ↓ (1025 → 1)</option>
          <option value="name-asc">Name A → Z</option>
          <option value="name-desc">Name Z → A</option>
        </select>
      </div>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <button
          onClick={() => setViewMode("list")}
          style={{ background: viewMode === "list" ? "#ffcb05" : "#ddd", padding: "0.5rem", borderRadius: "6px" }}
        >
          📄 List View
        </button>

        <button onClick={() => setViewMode("grid")}
          style={{ background: viewMode === "grid" ? "#ffcb05" : "#ddd", padding: "0.5rem", borderRadius: "6px" }}
          >
          🟦 Grid View
        </button>
      </div>

      <div style={{ margin: "1rem 0", display: "flex", gap: "1rem", flexWrap: "wrap"  }}>
        <button onClick={() => setType("fire")}>🔥 Fire</button>
        <button onClick={() => setType("water")}>💧 Water</button>
        <button onClick={() => setType("grass")}>🍃 Grass</button>
        <button onClick={() => setType("normal")}>⚪ Normal Pokemon</button>
        <button onClick={() => setType("electric")}>⚡Electric Pokemon</button>
        <button onClick={() => setType("ice")}>❄️ Ice Pokemon</button>
        <button onClick={() => setType("fighting")}>🥊 Fighting Pokemon</button>
        <button onClick={() => setType("poison")}>☠️ Poison Pokemon</button>
        <button onClick={() => setType("ground")}>🟤 Ground Pokemon</button>
        <button onClick={() => setType("flying")}>🕊️ Flying Pokemon</button>
        <button onClick={() => setType("psychic")}>🔮 Psychic Pokemon</button>
        <button onClick={() => setType("bug")}>🐛 Bug Pokemon</button>
        <button onClick={() => setType("rock")}>🪨 Rock Pokemon</button>
        <button onClick={() => setType("ghost")}>👻 Ghost Pokemon</button>
        <button onClick={() => setType("dragon")}>🐉 Dragon Pokemon</button>
        <button onClick={() => setType("dark")}>🌙 DarkPokemon</button>
        <button onClick={() => setType("steel")}>⚙️ Steel Pokemon</button>
        <button onClick={() => setType("fairy")}>✨ Fairy Pokemon</button>
        <button onClick={() => setType("")}>Clear Filter</button>
      </div>

      {viewMode === "list" ? (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {paginated.map((p) => (
            <PokemonListItem key={p.id} id={p.id} name={p.name} types={p.types} />
          ))}
        </ul>
      ) : (
        <div className="poke-grid">
          {paginated.map((p) => (
            <PokemonGridItem key={p.id} id={p.id} name={p.name} types={p.types} />
          ))}
        </div>
      )}

      <div className='pagination'>
        <button 
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        >
          ◀ Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next ▶
        </button>
      </div>

      {/* Filter buttons (typed + safe) */}

      <Outlet />
    </>
    )
  }

  function NotFound() {
    return <h1>404 - Page Not Found</h1>
  }

  function Favorites() { 
    const context = React.useContext(PokedexContext);
    if (!context) return null;

    const { favorites, removeFavorite } = context

    const navigate = useNavigate();

    const [pokemonList, setPokemonList] = useState<{
      id: number;
      name: string;
      sprite: string;
      types: string[];
    }[]>([]);

    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
      async function loadFavorites() {
        setLoading(true);

        const results = [];

        for (const id of favorites) {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
          const data = await res.json();

          results.push({
            id: id,
            name: data.name,
            sprite: data.sprites.front_default,
            types: data.types.map((t: any) => t.type.name)
          })
        }

        setPokemonList(results);
        setLoading(false);
      }

      if(favorites.length > 0) {
        loadFavorites();
      } else {
        setPokemonList([]);
        setLoading(false);
      }
    }, [favorites]);

    if (loading) return <h2>Loading Favs...</h2>

    return(
     <> 
      <h1>Favorites Page</h1>

      <button onClick={() => navigate('/')}>Home</button>
      
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pokemonList.map((p) => (
          <li key={p.id} style={{ marginBottom: "1.5rem" }}>
             <h2>  
              #{p.id} - {p.name.toUpperCase()}
             </h2>
            <img src={p.sprite} alt={p.name} width={120} />
            <p>Type: {p.types.join(", ")}</p>
            <button onClick={() => removeFavorite(p.id)}>
                Remove
              </button>
          </li>
        ))}
      </ul>
     </> 
    )
  }

  function PokemonDetails() {
    const context = React.useContext(PokedexContext)
    const { id } = useParams();
    const numericId = Number(id);

    
    if(!context) return null;

    const {addFavorite, removeFavorite, favorites} = context

    const isFav = favorites.includes(numericId);


    const [pokemon, setPokemon] = useState<null | {
      name: string;
      sprites: { front_default: string};
      types: 
      {type: {name: string} }[];
      stats: {base_stat: number; stat: {name: string}}[];
      abilities: {name: string; description: string }[];
    }>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      async function fetchPokemon() {
        try{
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${numericId}`);
          if(!res.ok) throw new Error("Pokemon not found");

          const data = await res.json();

          const abilityDetails = await Promise.all(
            data.abilities.map(async(a: any) => {
              const abilityRes = await fetch(a.ability.url);
              const abilityData = await abilityRes.json();

              const enlgishEntry = abilityData.effect_entries.find((e:any) => e.language.name === "en"
            );

            return {
              name: a.ability.name,
              description: enlgishEntry?.effect || "No description available"
                };
              })
            );

            const formatted = {
              name: data.name,
              sprites: data.sprites,
              types: data.types,
              stats: data.stats,
              abilities: abilityDetails
            }

            setPokemon(formatted)
          
        } catch(e) {
          setError("Failed to load Pokemon");
        } finally {
          setLoading(false)
        }
      }

      fetchPokemon();
    }, [numericId]);

    if (loading) return <h2>Loading Pokemon...</h2>
    if(error) return <h2>{error}</h2>
    if(!pokemon) return null;

    return(
      <>
        <h1>
          #{numericId} - {pokemon.name.toUpperCase()}
        </h1>

        <img 
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
          width={250}
        />

        
        <h3>Type(s):</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {pokemon.types.map((t, i) => (
            <TypeBadge key={i} type={t.type.name} />
          ))}
        </div>

        <h3>Stats:</h3>
        <div style={{ maxWidth: "400px" }}>
          {pokemon.stats.map((s, i) => (
            <div key={i} style={{ marginBottom: "0.4rem" }}>
              <strong>{s.stat.name.toUpperCase()}</strong>

              <div
                style={{
                  background: "#ddd",
                  height: "10px",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginTop: "4px"
                }}
              >
                <div
                  style={{
                    width: `${(s.base_stat / 150) * 100}%`,
                    background: "#4caf50",
                    height: "100%"
                  }}
                ></div>
              </div>

              <span style={{ fontSize: "0.8rem" }}>{s.base_stat}</span>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: "1rem" }}>Abilities:</h3>
        <ul>
          {pokemon.abilities.map((a, i) => (
            <li key={i} style={{ marginBottom: "0.8rem" }}>
              <strong>{a.name.toUpperCase()}</strong>
              <p style={{ margin: 0 }}>{a.description}</p>
            </li>
          ))}
        </ul>

        <button onClick={() => (isFav ? removeFavorite(numericId): addFavorite(numericId))}
           style={{
                fontSize: "2rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                marginTop: "1rem"
              }}
        >
          {isFav ? "⭐ Remove Favorite" : "☆ Add to Favorite"}
        </button>
      </>
    )
  }

  function PokemonListItem({ id, name, types }: {id: number; name: string; types: string[] }) {
    const context = React.useContext(PokedexContext);
    if(!context) return null;

    const { favorites, addFavorite, removeFavorite } = context;
    const navigate =  useNavigate();
    
    const isFav =  favorites.includes(id);

    return(
      <>
    <li className='pokemon-item'>
      {/* Left: Image + Name */}
      <div className='pokemon-left'>
        <img
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
          alt={name}
          width={50}
        />

        <div onClick={() => navigate(`/pokemon/${id}`)} style={{ cursor: "pointer" }}>
          <strong>{name.toUpperCase()}</strong> #{id}

          <div style={{ marginTop: "0.25rem", display: "flex", gap: "0.3rem" }}>
            {types.map((t: any) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
        </div>
      </div>

      {/* Right: Favorite toggle */}
      <button className='star-btn' onClick={() => (isFav ? removeFavorite(id) : addFavorite(id))}>
        {isFav ? "⭐" : "☆"}
      </button>
    </li>
      </>
      )
  }

  function PokemonGridItem({id, name, types}: {id: number; name: string; types: string[] }) {
    const navigate = useNavigate();
    const context = React.useContext(PokedexContext)
    if(!context) return null;

    const { favorites, addFavorite, removeFavorite } = context;
    const isFav = favorites.includes(id);

    return(
      <>
        <div 
          className="poke-card" 
          onClick={() => navigate(`/pokemon/${id}`)}
          style={{
            background: `${TYPE_COLORS[types[0]]}30`,
            border: `2px solid ${TYPE_COLORS[types[0]]}`,
            borderRadius: "12px",
            padding: "0.7rem",
            cursor: "pointer",
            transition: "transform 0.15s ease"
          }}
          >


          <img 
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
            alt={name}
            width={70}
          />

          <strong>{name.toUpperCase()}</strong>
          <small>#{id}</small>

          <div className="poke-card-types">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>

          <button onClick={(e) => {
            e.stopPropagation();
            isFav ? removeFavorite(id) : addFavorite(id);
          }}
            style={{
            marginTop: "0.3rem",
            fontSize: "1.2rem",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
          >
            {isFav ? "⭐" : "☆"}
          </button>

        </div>
      </>
    )

  }

  function PokemonSkeleton() {
    return(
      <>
        <li style={{ 
          marginBottom: "0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          {/*Image PH */}
          <div style={{
            width: "50px",
            height: "50px",
            background: "linear-gradient(90deg, #e2e2e2, #f5f5f5, #e2e2e2)",
            animation: "shimmer 1.2s infinite",
            borderRadius: "8px"
          }}>
          </div>
          {/*Name PH */}
          <div style={{ 
             width: "50px",
             height: "50px",
             background: "linear-gradient(90deg, #e2e2e2, #f5f5f5, #e2e2e2)",
             animation: "shimmer 1.2s infinite",
             borderRadius: "8px"
          }}>
          </div>
          {/*Star PH */}
          <div style={{ 
            width: "25px",
            height: "25px",
            background: "linear-gradient(90deg, #e2e2e2, #f5f5f5, #e2e2e2)",
            animation: "shimmer 1.2s infinite",
            borderRadius: "50%"
           }}>
          </div>

        </li>
      </>
    )
  }

  function FirePokemon() {
    return <h2>🔥 Fire Pokémon</h2>;
  }

  function WaterPokemon() {
    return <h2>💧 Water Pokémon</h2>;
  }

  function GrassPokemon() {
    return <h2>🍃 Grass Pokémon</h2>;
  }

  function NormalPokemon() {
    return <h2>⚪ Normal Pokemon</h2>
  }

  function ElectricPokemon() {
    return <h2>⚡Electric Pokemon</h2>
  }

  function IcePokemon() {
    return <h2>❄️ Ice Pokemon</h2>
  }

  function FightingPokemon() {
    return <h2>🥊 Fighting Pokemon</h2>
  }

  function PoisonPokemon() {
    return <h2>☠️ Poison Pokemon</h2>
  }

  function GroundPokemon() {
    return <h2>🟤 Ground Pokemon</h2>
  }

  function FlyingPokemon() {
    return <h2>🕊️ Flying Pokemon</h2>
  }

  function PsychicPokemon() {
    return <h2>🔮 Psychic Pokemon</h2>
  }

  function BugPokemon() {
    return <h2>🐛 Bug Pokemon</h2>
  }

  function RockPokemon() {
    return <h2>🪨 Rock Pokemon</h2>
  }

  function GhostPokemon() {
    return <h2>👻 Ghost Pokemon</h2>
  }

  function DragonPokemon() {
    return <h2>🐉 Dragon Pokemon</h2>
  }

  function DarkPokemon() {
    return <h2>🌙 DarkPokemon</h2>
  }

  function SteelPokemon() {
    return <h2>⚙️ Steel Pokemon</h2>
  }

  function FairyPokemon() {
    return <h2>✨ Fairy Pokemon</h2>
  }

  function Help() {
    const navigate = useNavigate();

    return(
      <>
        <h1>Help - Q&A's</h1>
        <button onClick={() => navigate("/")}>
          Home
        </button>
      </>
    )
  }

export default App
