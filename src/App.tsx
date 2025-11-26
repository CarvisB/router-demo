import React, { useEffect, useReducer, useState, type JSX } from 'react'
import { Routes, Route, Link, Outlet, Navigate, useNavigate, useSearchParams } from "react-router-dom"
import { useParams } from 'react-router-dom'
import './App.css'

type PokedexContextType = {
  favorites: number[];
  addFavorite: (id:number) => void;
  removeFavorite: (id:number) => void;
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
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
        backgroundColor: colors[type] || "#AAA",
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

    const type: string | null = searchParams.get("type");
    console.log(type)

    useEffect(() => {
      async function loadPokemon() {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=151`);
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

     const filt = pokemonList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
    );

    const typeFiltered = type 
  ? filt.filter(p => p.types.includes(type))
  : filt;


    
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
        type='text'
        placeholder='Search Pokemon...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "0.5rem", marginBottom: "1rem", width: "200px" }}
      />

      <ul style={{ listStyle: "none", padding: 0 }}>
        {typeFiltered.map ((p) => (
          <PokemonListItem key={p.id} id={p.id} name={p.name} types={p.types} />
        ))}
      </ul>

      {/* Filter buttons (typed + safe) */}
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


      <nav style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link to="fire">Fire Pokemon</Link>
        <Link to="water">Water Pokemon</Link>
        <Link to="grass">Grass Pokemon</Link>
        <Link to="normal">Normal Pokemon</Link>
        <Link to="electric">Electric Pokemon</Link>
        <Link to="ice">Ice Pokemon</Link>
        <Link to="fighting">Fighting Pokemon</Link>
        <Link to="poison">Poison Pokemon</Link>
        <Link to="ground">Ground Pokemon</Link>
        <Link to="flying">Flying Pokemon</Link>
        <Link to="psychic">Psychic Pokemon</Link>
        <Link to="bug">Bug Pokemon</Link>
        <Link to="rock">Rock Pokemon</Link>
        <Link to="ghost">Ghost Pokemon</Link>
        <Link to="dragon">Dragon Pokemon</Link>
        <Link to="dark">Dark Pokemon</Link>
        <Link to="steel">Steel Pokemon</Link>
        <Link to="fairy">Fairy Pokemon</Link>
      </nav>

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
    }>(null);

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function fetchPokemon() {
        try{
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${numericId}`);
          if(!res.ok) throw new Error("Pokemon not found");

          const data = await res.json();
          setPokemon(data)
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
          width={150}
        />

        <h3>Type(s):</h3>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {pokemon.types.map((t, i) => (
            <TypeBadge key={i} type={t.type.name} />
          ))}
        </div>


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
    <li
      style={{
        marginBottom: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        justifyContent: "space-between"
      }}
    >
      {/* Left: Image + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
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
      <button
        onClick={() => (isFav ? removeFavorite(id) : addFavorite(id))}
        style={{
          fontSize: "1.5rem",
          background: "none",
          border: "none",
          cursor: "pointer"
        }}
      >
        {isFav ? "⭐" : "☆"}
      </button>
    </li>
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
          gap: "1rem"
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
